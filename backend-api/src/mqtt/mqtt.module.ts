import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttService } from './mqtt.service';
import { Machine } from '../machines/machine.entity';
import { Metric } from '../metrics/metric.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Machine, Metric])],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}


