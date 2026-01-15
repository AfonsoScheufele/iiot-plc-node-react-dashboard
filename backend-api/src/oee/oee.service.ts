import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionRun } from './production-run.entity';
import { DowntimeEvent } from './downtime-event.entity';
import { QualityDefect } from './quality-defect.entity';

@Injectable()
export class OeeService {
  private readonly logger = new Logger(OeeService.name);

  constructor(
    @InjectRepository(ProductionRun)
    private productionRunRepository: Repository<ProductionRun>,
    @InjectRepository(DowntimeEvent)
    private downtimeEventRepository: Repository<DowntimeEvent>,
    @InjectRepository(QualityDefect)
    private qualityDefectRepository: Repository<QualityDefect>,
  ) {}

  /**
   * Calcula OEE para um período específico
   * OEE = Availability × Performance × Quality
   */
  async calculateOEE(
    machineId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<{
    availability: number;
    performance: number;
    quality: number;
    oee: number;
    plannedTime: number;
    operatingTime: number;
    actualProduction: number;
    goodParts: number;
    totalParts: number;
  }> {
    const productionRuns = await this.productionRunRepository
      .createQueryBuilder('run')
      .where('run.machineId = :machineId', { machineId })
      .andWhere(
        '(run.startTime >= :startTime AND run.startTime <= :endTime) OR ' +
        '(run.endTime >= :startTime AND run.endTime <= :endTime) OR ' +
        '(run.startTime <= :startTime AND run.endTime >= :endTime)',
        { startTime, endTime }
      )
      .getMany();
    

    const downtimeEvents = await this.downtimeEventRepository
      .createQueryBuilder('event')
      .where('event.machineId = :machineId', { machineId })
      .andWhere('event.startTime >= :startTime', { startTime })
      .andWhere('event.startTime <= :endTime', { endTime })
      .andWhere('event.status = :status', { status: 'RESOLVED' })
      .getMany();

    const defects = await this.qualityDefectRepository
      .createQueryBuilder('defect')
      .where('defect.machineId = :machineId', { machineId })
      .andWhere('defect.timestamp >= :startTime', { startTime })
      .andWhere('defect.timestamp <= :endTime', { endTime })
      .getMany();

    const plannedTime = productionRuns.reduce((sum, run) => sum + run.plannedTime, 0);
    const operatingTime = productionRuns.reduce((sum, run) => sum + run.operatingTime, 0);
    const totalDowntime = downtimeEvents.reduce((sum, event) => sum + (event.duration || 0), 0);
    
    const actualProduction = productionRuns.reduce((sum, run) => sum + run.actualProduction, 0);
    const goodParts = productionRuns.reduce((sum, run) => sum + run.goodParts, 0);
    const totalParts = actualProduction;
    const defectiveParts = defects.reduce((sum, defect) => sum + defect.quantity, 0);

    const availability = plannedTime > 0 
      ? ((operatingTime / plannedTime) * 100) 
      : 0;

    const idealCycleTime = 1;
    const idealOutput = operatingTime / idealCycleTime;
    const performance = idealOutput > 0 
      ? ((actualProduction / idealOutput) * 100) 
      : 0;

    const calculatedGoodParts = productionRuns.reduce((sum, run) => sum + run.goodParts, 0);
    
    const quality = totalParts > 0 
      ? ((calculatedGoodParts / totalParts) * 100) 
      : 0;

    const oee = (availability * performance * quality) / 10000;

    return {
      availability: Math.round(availability * 100) / 100,
      performance: Math.round(performance * 100) / 100,
      quality: Math.round(quality * 100) / 100,
      oee: Math.round(oee * 100) / 100,
      plannedTime,
      operatingTime,
      actualProduction,
      goodParts: calculatedGoodParts,
      totalParts,
    };
  }

  /**
   * Cria ou atualiza um ProductionRun
   */
  async createOrUpdateProductionRun(data: Partial<ProductionRun>): Promise<ProductionRun> {
    let run = await this.productionRunRepository.findOne({
      where: {
        machineId: data.machineId,
        status: 'RUNNING',
      },
    });

    if (!run) {
      run = this.productionRunRepository.create({
        ...data,
        startTime: data.startTime || new Date(),
        status: 'RUNNING',
      });
    } else {
      Object.assign(run, data);
      run.updatedAt = new Date();
    }

    if (run.plannedTime > 0 && run.operatingTime > 0) {
      run.availability = (run.operatingTime / run.plannedTime) * 100;
    }

    if (run.actualProduction > 0) {
      const idealCycleTime = 1;
      const idealOutput = run.operatingTime / idealCycleTime;
      run.performance = idealOutput > 0 ? (run.actualProduction / idealOutput) * 100 : 0;
    }

    if (run.actualProduction > 0) {
      run.quality = ((run.goodParts / run.actualProduction) * 100);
    }

    if (run.availability && run.performance && run.quality) {
      run.oee = (run.availability * run.performance * run.quality) / 10000;
    }

    return this.productionRunRepository.save(run);
  }

  /**
   * Cria um evento de downtime
   */
  async createDowntimeEvent(data: Partial<DowntimeEvent>): Promise<DowntimeEvent> {
    const event = this.downtimeEventRepository.create({
      ...data,
      startTime: data.startTime || new Date(),
      status: 'ACTIVE',
    });
    return this.downtimeEventRepository.save(event);
  }

  /**
   * Resolve um evento de downtime
   */
  async resolveDowntimeEvent(id: number): Promise<DowntimeEvent> {
    const event = await this.downtimeEventRepository.findOne({ where: { id } });
    if (!event) {
      throw new Error(`Downtime event ${id} não encontrado`);
    }

    event.endTime = new Date();
    event.status = 'RESOLVED';
    
    if (event.startTime) {
      const durationMs = event.endTime.getTime() - event.startTime.getTime();
      event.duration = Math.floor(durationMs / (1000 * 60));
    }

    return this.downtimeEventRepository.save(event);
  }

  /**
   * Registra um defeito de qualidade
   */
  async recordQualityDefect(data: Partial<QualityDefect>): Promise<QualityDefect> {
    const defect = this.qualityDefectRepository.create({
      ...data,
      timestamp: data.timestamp || new Date(),
    });
    return this.qualityDefectRepository.save(defect);
  }

  /**
   * Busca ProductionRuns
   */
  async findProductionRuns(machineId?: string, from?: Date, to?: Date) {
    const query = this.productionRunRepository.createQueryBuilder('run');

    if (machineId) {
      query.where('run.machineId = :machineId', { machineId });
    }

    if (from && to) {
      query.andWhere(
        '(run.startTime >= :from AND run.startTime <= :to) OR ' +
        '(run.endTime >= :from AND run.endTime <= :to) OR ' +
        '(run.startTime <= :from AND run.endTime >= :to)',
        { from, to }
      );
    }

    query.orderBy('run.startTime', 'DESC').limit(100);
    return query.getMany();
  }

  /**
   * Busca DowntimeEvents
   */
  async findDowntimeEvents(machineId?: string, from?: Date, to?: Date) {
    const query = this.downtimeEventRepository.createQueryBuilder('event');

    if (machineId) {
      query.where('event.machineId = :machineId', { machineId });
    }

    if (from && to) {
      query.andWhere(
        '(event.startTime >= :from AND event.startTime <= :to) OR ' +
        '(event.endTime >= :from AND event.endTime <= :to) OR ' +
        '(event.startTime <= :from AND event.endTime >= :to)',
        { from, to }
      );
    }

    query.orderBy('event.startTime', 'DESC').limit(100);
    return query.getMany();
  }

  /**
   * Gera dados de exemplo para demonstração
   */
  async generateSampleData(machineId: string) {
    try {
      await this.productionRunRepository.delete({ machineId });
      await this.downtimeEventRepository.delete({ machineId });
      await this.qualityDefectRepository.delete({ machineId });
      
      const now = new Date();
      const savedRuns = [];

      for (let day = 0; day < 30; day++) {
        const runStart = new Date(now);
        runStart.setDate(runStart.getDate() - day);
        runStart.setHours(6, 0, 0, 0);

        const runEnd = new Date(runStart);
        runEnd.setHours(22, 0, 0, 0);

        if (runEnd > now) {
          runEnd.setTime(now.getTime());
        }

        const plannedProduction = 800 + Math.floor(Math.random() * 400);
        const actualProduction = Math.floor(plannedProduction * (0.75 + Math.random() * 0.2));
        const defectiveParts = Math.floor(actualProduction * (0.02 + Math.random() * 0.03));
        const goodParts = actualProduction - defectiveParts;
        const plannedTime = 16 * 60;
        const downtime = Math.floor(Math.random() * 120) + 30;
        const operatingTime = plannedTime - downtime;

        const productionRun = await this.productionRunRepository.create({
          machineId,
          startTime: runStart,
          endTime: runEnd,
          plannedProduction,
          actualProduction,
          goodParts,
          defectiveParts,
          plannedTime,
          operatingTime,
          downtime,
          status: 'COMPLETED',
        });

        if (productionRun.plannedTime > 0 && productionRun.operatingTime > 0) {
          productionRun.availability = (productionRun.operatingTime / productionRun.plannedTime) * 100;
        }

        if (productionRun.actualProduction > 0) {
          const idealCycleTime = 1;
          const idealOutput = productionRun.operatingTime / idealCycleTime;
          productionRun.performance = idealOutput > 0 ? (productionRun.actualProduction / idealOutput) * 100 : 0;
        }

        if (productionRun.actualProduction > 0) {
          productionRun.quality = ((productionRun.goodParts / productionRun.actualProduction) * 100);
        }

        if (productionRun.availability && productionRun.performance && productionRun.quality) {
          productionRun.oee = (productionRun.availability * productionRun.performance * productionRun.quality) / 10000;
        }

        const savedRun = await this.productionRunRepository.save(productionRun);
        savedRuns.push(savedRun);

        const downtimeCount = Math.floor(Math.random() * 3) + 1;
        for (let d = 0; d < downtimeCount; d++) {
          const downtimeStart = new Date(runStart.getTime() + (d + 1) * 4 * 60 * 60 * 1000);
          const downtimeDuration = Math.floor(Math.random() * 60) + 15;
          const downtimeEnd = new Date(downtimeStart.getTime() + downtimeDuration * 60 * 1000);
          
          if (downtimeEnd > now) {
            downtimeEnd.setTime(now.getTime());
          }
          
          const categories = ['UNPLANNED', 'MAINTENANCE', 'SETUP', 'MATERIAL'];
          const reasons = [
            'Equipment malfunction',
            'Scheduled maintenance',
            'Changeover',
            'Material shortage',
            'Quality check',
          ];

          const downtimeEvent = await this.createDowntimeEvent({
            machineId,
            category: categories[Math.floor(Math.random() * categories.length)],
            reason: reasons[Math.floor(Math.random() * reasons.length)],
            startTime: downtimeStart,
          });

          downtimeEvent.endTime = downtimeEnd;
          downtimeEvent.status = 'RESOLVED';
          downtimeEvent.duration = downtimeDuration;
          await this.downtimeEventRepository.save(downtimeEvent);
        }

        const defectTypes = ['DIMENSION', 'SURFACE', 'MATERIAL', 'ASSEMBLY', 'OTHER'];
        const defectCount = Math.floor(Math.random() * 5) + 2;
        for (let i = 0; i < defectCount; i++) {
          await this.recordQualityDefect({
            machineId,
            defectType: defectTypes[Math.floor(Math.random() * defectTypes.length)],
            quantity: Math.floor(Math.random() * 5) + 1,
            description: `Defect detected during production`,
            timestamp: new Date(runStart.getTime() + i * 2 * 60 * 60 * 1000),
          });
        }
      }

      return {
        productionRuns: savedRuns,
        message: `Sample data generated successfully for 30 days (${savedRuns.length} production runs)`,
      };
    } catch (error) {
      this.logger.error(`❌ Erro ao gerar dados de exemplo para ${machineId}:`, error);
      throw error;
    }
  }

  async clearMachineData(machineId: string) {
    await this.productionRunRepository.delete({ machineId });
    await this.downtimeEventRepository.delete({ machineId });
    await this.qualityDefectRepository.delete({ machineId });
  }
}

