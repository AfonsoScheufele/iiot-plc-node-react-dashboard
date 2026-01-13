import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { connect, MqttClient } from 'mqtt';
import { Machine } from '../machines/machine.entity';
import { Metric } from '../metrics/metric.entity';
import { AlertsService } from '../alerts/alerts.service';
import { PerformanceService } from '../performance/performance.service';

@Injectable()
export class MqttService implements OnModuleInit {
  private readonly logger = new Logger(MqttService.name);
  private client: MqttClient;

  constructor(
    @InjectRepository(Machine)
    private machineRepository: Repository<Machine>,
    @InjectRepository(Metric)
    private metricRepository: Repository<Metric>,
    private alertsService: AlertsService,
    private performanceService: PerformanceService,
  ) {}

  async onModuleInit() {
    const brokerUrl = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
    const topic = process.env.MQTT_TOPIC || 'factory/machines/+';

    this.client = connect(brokerUrl);

    this.client.on('connect', () => {
      this.logger.log(`✅ Conectado ao broker MQTT: ${brokerUrl}`);
      this.client.subscribe(topic, (err) => {
        if (err) {
          this.logger.error(`❌ Erro ao subscrever no tópico ${topic}:`, err);
        } else {
          this.logger.log(`📡 Inscrito no tópico: ${topic}`);
        }
      });
    });

    this.client.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        this.logger.log(`📨 Mensagem recebida do tópico ${topic}: ${JSON.stringify(data)}`);
        await this.processMessage(data);
      } catch (error) {
        this.logger.error('❌ Erro ao processar mensagem MQTT:', error);
      }
    });

    this.client.on('error', (error) => {
      this.logger.error('❌ Erro na conexão MQTT:', error);
    });
  }

  private async processMessage(data: any) {
    const { machineId, temperature, pressure, status, timestamp } = data;

    if (!machineId) {
      this.logger.warn('Mensagem sem machineId, ignorando...');
      return;
    }

    let machine = await this.machineRepository.findOne({
      where: { id: machineId },
    });

    if (!machine) {
      machine = this.machineRepository.create({
        id: machineId,
        name: `Máquina ${machineId}`,
        status: status,
      });
      await this.machineRepository.save(machine);
      this.logger.log(`🆕 Nova máquina criada: ${machineId}`);
    } else {
      machine.status = status;
      machine.updatedAt = new Date();
      await this.machineRepository.save(machine);
    }

    const metric = this.metricRepository.create({
      machineId,
      temperature: parseFloat(temperature),
      pressure: parseFloat(pressure),
      status,
      timestamp: new Date(timestamp),
    });

    await this.metricRepository.save(metric);
    this.logger.log(`📊 Métrica salva: ${machineId} - Temp: ${temperature}°C, Pressão: ${pressure}bar`);

    await this.alertsService.checkThresholds(machineId, parseFloat(temperature), parseFloat(pressure), status);
    this.performanceService.recordMessage();
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.end();
    }
  }
}

