import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttService } from './mqtt.service';
import { Machine } from '../machines/machine.entity';
import { Metric } from '../metrics/metric.entity';
import { AlertsModule } from '../alerts/alerts.module';
import { PerformanceModule } from '../performance/performance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Machine, Metric]),
    AlertsModule,
    PerformanceModule,
  ],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}



