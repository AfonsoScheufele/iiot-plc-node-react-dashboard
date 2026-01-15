import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './alert.entity';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private readonly TEMP_THRESHOLD_HIGH = 80;
  private readonly TEMP_THRESHOLD_LOW = 60;
  private readonly PRESSURE_THRESHOLD_HIGH = 5.5;
  private readonly PRESSURE_THRESHOLD_LOW = 3.0;

  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
  ) {}

  async checkThresholds(machineId: string, temperature: number, pressure: number, status: string) {
    const alerts: Alert[] = [];

    if (temperature > this.TEMP_THRESHOLD_HIGH) {
      const alert = this.alertRepository.create({
        machineId,
        type: 'TEMPERATURE_HIGH',
        severity: 'HIGH',
        message: `Temperature ${temperature}°C exceeds threshold of ${this.TEMP_THRESHOLD_HIGH}°C`,
        temperature,
      });
      alerts.push(alert);
      this.logger.warn(`🚨 ALERT: ${machineId} - High temperature: ${temperature}°C`);
    }

    if (temperature < this.TEMP_THRESHOLD_LOW) {
      const alert = this.alertRepository.create({
        machineId,
        type: 'TEMPERATURE_LOW',
        severity: 'MEDIUM',
        message: `Temperature ${temperature}°C below threshold of ${this.TEMP_THRESHOLD_LOW}°C`,
        temperature,
      });
      alerts.push(alert);
      this.logger.warn(`🚨 ALERT: ${machineId} - Low temperature: ${temperature}°C`);
    }

    if (pressure > this.PRESSURE_THRESHOLD_HIGH) {
      const alert = this.alertRepository.create({
        machineId,
        type: 'PRESSURE_HIGH',
        severity: 'HIGH',
        message: `Pressure ${pressure}bar exceeds threshold of ${this.PRESSURE_THRESHOLD_HIGH}bar`,
        pressure,
      });
      alerts.push(alert);
      this.logger.warn(`🚨 ALERT: ${machineId} - High pressure: ${pressure}bar`);
    }

    if (pressure < this.PRESSURE_THRESHOLD_LOW) {
      const alert = this.alertRepository.create({
        machineId,
        type: 'PRESSURE_LOW',
        severity: 'MEDIUM',
        message: `Pressure ${pressure}bar below threshold of ${this.PRESSURE_THRESHOLD_LOW}bar`,
        pressure,
      });
      alerts.push(alert);
      this.logger.warn(`🚨 ALERT: ${machineId} - Low pressure: ${pressure}bar`);
    }

    if (status === 'ERROR') {
      const alert = this.alertRepository.create({
        machineId,
        type: 'MACHINE_ERROR',
        severity: 'CRITICAL',
        message: `Machine ${machineId} is in ERROR state`,
      });
      alerts.push(alert);
      this.logger.error(`🚨 ALERT: ${machineId} - Machine ERROR state`);
    }

    if (alerts.length > 0) {
      await this.alertRepository.save(alerts);
    }

    return alerts;
  }

  async findAll(machineId?: string, resolved?: boolean) {
    const query = this.alertRepository.createQueryBuilder('alert');

    if (machineId) {
      query.where('alert.machineId = :machineId', { machineId });
    }

    if (resolved !== undefined) {
      query.andWhere('alert.resolved = :resolved', { resolved });
    }

    query.orderBy('alert.createdAt', 'DESC').limit(100);

    return query.getMany();
  }

  async resolve(id: number) {
    const alert = await this.alertRepository.findOne({ where: { id } });
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      return this.alertRepository.save(alert);
    }
    return null;
  }
}



