import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OeeService } from './oee.service';
import { OeeController } from './oee.controller';
import { ProductionRun } from './production-run.entity';
import { DowntimeEvent } from './downtime-event.entity';
import { QualityDefect } from './quality-defect.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductionRun, DowntimeEvent, QualityDefect]),
  ],
  providers: [OeeService],
  controllers: [OeeController],
  exports: [OeeService],
})
export class OeeModule {}

