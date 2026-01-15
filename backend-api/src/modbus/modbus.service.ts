import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModbusConfig } from './modbus-config.entity';
import { MqttService } from '../mqtt/mqtt.service';

@Injectable()
export class ModbusService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ModbusService.name);
  private tcpClients = new Map<string, any>();
  private rtuClients = new Map<string, any>();
  private pollingIntervals = new Map<string, NodeJS.Timeout>();

  constructor(
    @InjectRepository(ModbusConfig)
    private modbusConfigRepository: Repository<ModbusConfig>,
    private mqttService: MqttService,
  ) {}

  async onModuleInit() {
    this.logger.log('🔌 Inicializando serviço Modbus...');
    try {
      await this.loadAndStartConfigs();
    } catch (error) {
      this.logger.warn('⚠️  Não foi possível carregar configurações Modbus (banco pode não estar pronto ainda):', error.message);
    }
  }

  async onModuleDestroy() {
    this.pollingIntervals.forEach((interval) => clearInterval(interval));
    this.tcpClients.forEach((client) => {
      if (client?.close) {
        client.close();
      }
    });
    this.rtuClients.forEach((client) => {
      if (client?.close) {
        client.close();
      }
    });
  }

  async loadAndStartConfigs() {
    try {
      const configs = await this.modbusConfigRepository.find({
        where: { enabled: true },
      });

      if (configs.length === 0) {
        this.logger.log('📋 Nenhuma configuração Modbus habilitada encontrada');
        return;
      }

      this.logger.log(`📋 Carregando ${configs.length} configuração(ões) Modbus...`);
      for (const config of configs) {
        await this.startPolling(config);
      }
    } catch (error) {
      this.logger.error('❌ Erro ao carregar configurações Modbus:', error.message);
      throw error;
    }
  }

  async createConfig(configData: Partial<ModbusConfig>): Promise<ModbusConfig> {
    const config = this.modbusConfigRepository.create(configData);
    const saved = await this.modbusConfigRepository.save(config);
    
    if (saved.enabled) {
      await this.startPolling(saved);
    }
    
    return saved;
  }

  async updateConfig(id: number, configData: Partial<ModbusConfig>): Promise<ModbusConfig> {
    const config = await this.modbusConfigRepository.findOne({ where: { id } });
    if (!config) {
      throw new Error(`Configuração Modbus ${id} não encontrada`);
    }

    await this.stopPolling(config.id);

    Object.assign(config, configData);
    const updated = await this.modbusConfigRepository.save(config);

    if (updated.enabled) {
      await this.startPolling(updated);
    }

    return updated;
  }

  async deleteConfig(id: number): Promise<void> {
    await this.stopPolling(id);
    await this.modbusConfigRepository.delete(id);
  }

  async startPolling(config: ModbusConfig) {
    const key = `config-${config.id}`;

    if (this.pollingIntervals.has(key)) {
      clearInterval(this.pollingIntervals.get(key)!);
    }

    try {
      if (config.protocol === 'TCP') {
        await this.startTCPPolling(config);
      } else {
        await this.startRTUPolling(config);
      }
    } catch (error) {
      this.logger.error(`❌ Erro ao iniciar polling Modbus para ${config.name}:`, error);
    }
  }

  private async startTCPPolling(config: ModbusConfig) {
    const key = `config-${config.id}`;
    
    try {
      const ModbusRTU = require('modbus-serial');
      const client = new ModbusRTU();

      await client.connectTCP(config.host, { port: config.port });
      client.setID(config.unitId);
      client.setTimeout(5000);

      this.logger.log(`✅ Conectado Modbus TCP: ${config.host}:${config.port} (${config.name})`);
      this.tcpClients.set(key, client);

      const interval = setInterval(async () => {
        try {
          const result = await client.readHoldingRegisters(
            config.startAddress,
            config.quantity,
          );

          const temperature = result.data[0] / 10;
          const pressure = result.data[1] / 10;
          const statusCode = result.data[2] || 1;
          const status = statusCode === 1 ? 'RUNNING' : statusCode === 0 ? 'STOPPED' : 'ERROR';

          const mqttData = {
            machineId: config.machineId,
            temperature,
            pressure,
            status,
            timestamp: new Date().toISOString(),
            source: 'modbus',
            modbusConfigId: config.id,
          };

          await this.mqttService.publishMetric(mqttData);
          this.logger.debug(`📊 Modbus ${config.name}: Temp=${temperature}°C, Pressão=${pressure}bar, Status=${status}`);
          
        } catch (error) {
          this.logger.error(`❌ Erro ao ler Modbus ${config.name}:`, error);
        }
      }, 2000);

      this.pollingIntervals.set(key, interval);
    } catch (error) {
      this.logger.error(`❌ Erro ao conectar Modbus TCP ${config.name}:`, error);
    }
  }

  private async startRTUPolling(config: ModbusConfig) {
    const key = `config-${config.id}`;
    
    try {
      const ModbusRTU = require('modbus-serial');
      const client = new ModbusRTU();

      await client.connectRTUBuffered(config.serialPort, {
        baudRate: config.baudRate,
        dataBits: config.dataBits,
        stopBits: config.stopBits,
        parity: config.parity,
      });
      client.setID(config.unitId);
      client.setTimeout(5000);

      this.logger.log(`✅ Conectado Modbus RTU: ${config.serialPort} (${config.name})`);
      this.rtuClients.set(key, client);

      const interval = setInterval(async () => {
        try {
          const result = await client.readHoldingRegisters(
            config.startAddress,
            config.quantity,
          );

          const temperature = result.data[0] / 10;
          const pressure = result.data[1] / 10;
          const statusCode = result.data[2] || 1;
          const status = statusCode === 1 ? 'RUNNING' : statusCode === 0 ? 'STOPPED' : 'ERROR';

          const mqttData = {
            machineId: config.machineId,
            temperature,
            pressure,
            status,
            timestamp: new Date().toISOString(),
            source: 'modbus',
            modbusConfigId: config.id,
          };

          await this.mqttService.publishMetric(mqttData);
          this.logger.debug(`📊 Modbus RTU ${config.name}: Temp=${temperature}°C, Pressão=${pressure}bar, Status=${status}`);
          
        } catch (error) {
          this.logger.error(`❌ Erro ao ler Modbus RTU ${config.name}:`, error);
        }
      }, 2000);

      this.pollingIntervals.set(key, interval);
    } catch (error) {
      this.logger.error(`❌ Erro ao conectar Modbus RTU ${config.name}:`, error);
    }
  }

  async stopPolling(configId: number) {
    const key = `config-${configId}`;
    
    if (this.pollingIntervals.has(key)) {
      clearInterval(this.pollingIntervals.get(key)!);
      this.pollingIntervals.delete(key);
    }

    if (this.tcpClients.has(key)) {
      const client = this.tcpClients.get(key);
      if (client?.close) {
        client.close();
      }
      this.tcpClients.delete(key);
    }

    if (this.rtuClients.has(key)) {
      const client = this.rtuClients.get(key);
      if (client?.close) {
        client.close();
      }
      this.rtuClients.delete(key);
    }
  }

  async findAllConfigs() {
    return this.modbusConfigRepository.find();
  }

  async findConfigById(id: number) {
    return this.modbusConfigRepository.findOne({ where: { id } });
  }
}

