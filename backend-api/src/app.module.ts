import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttModule } from './mqtt/mqtt.module';
import { MachinesModule } from './machines/machines.module';
import { MetricsModule } from './metrics/metrics.module';
import { AuthModule } from './auth/auth.module';
import { AlertsModule } from './alerts/alerts.module';
import { PerformanceModule } from './performance/performance.module';
import { WebSocketModule } from './websocket/websocket.module';
import { ModbusModule } from './modbus/modbus.module';
import { OeeModule } from './oee/oee.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5433,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'iiot_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    WebSocketModule,
    MqttModule,
    MachinesModule,
    MetricsModule,
    AuthModule,
    AlertsModule,
    PerformanceModule,
    ModbusModule,
    OeeModule,
  ],
})
export class AppModule {}

