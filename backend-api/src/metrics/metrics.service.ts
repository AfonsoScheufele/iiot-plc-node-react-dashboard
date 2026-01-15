import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Metric } from './metric.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Metric)
    private metricRepository: Repository<Metric>,
  ) {}

  async findMetrics(machineId?: string, from?: string, to?: string) {
    const query = this.metricRepository.createQueryBuilder('metric');

    if (machineId) {
      query.where('metric.machineId = :machineId', { machineId });
    }

    if (from && to) {
      query.andWhere('metric.timestamp BETWEEN :from AND :to', {
        from: new Date(from),
        to: new Date(to),
      });
    } else if (from) {
      query.andWhere('metric.timestamp >= :from', { from: new Date(from) });
    } else if (to) {
      query.andWhere('metric.timestamp <= :to', { to: new Date(to) });
    }

    query.orderBy('metric.timestamp', 'DESC').limit(1000);

    return query.getMany();
  }
}





