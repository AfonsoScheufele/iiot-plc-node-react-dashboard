import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModbusService } from './modbus.service';
import { ModbusController } from './modbus.controller';
import { ModbusConfig } from './modbus-config.entity';
import { MqttModule } from '../mqtt/mqtt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModbusConfig]),
    forwardRef(() => MqttModule),
  ],
  providers: [ModbusService],
  controllers: [ModbusController],
  exports: [ModbusService],
})
export class ModbusModule {}

