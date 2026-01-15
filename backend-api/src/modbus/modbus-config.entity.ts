import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('modbus_configs')
export class ModbusConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  machineId: string;

  @Column({ type: 'enum', enum: ['TCP', 'RTU'], default: 'TCP' })
  protocol: 'TCP' | 'RTU';

  // TCP settings
  @Column({ nullable: true })
  host: string;

  @Column({ nullable: true, default: 502 })
  port: number;

  // RTU settings
  @Column({ nullable: true })
  serialPort: string;

  @Column({ nullable: true, default: 9600 })
  baudRate: number;

  @Column({ nullable: true, default: 8 })
  dataBits: number;

  @Column({ nullable: true, default: 1 })
  stopBits: number;

  @Column({ nullable: true, default: 'none' })
  parity: string;

  // Modbus settings
  @Column({ default: 1 })
  unitId: number;

  @Column({ default: 0 })
  startAddress: number;

  @Column({ default: 10 })
  quantity: number;

  @Column({ default: true })
  enabled: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

