import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Machine } from '../machines/machine.entity';

@Entity('metrics')
@Index(['machineId', 'timestamp'])
export class Metric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  machineId: string;

  @ManyToOne(() => Machine, (machine) => machine.metrics)
  @JoinColumn({ name: 'machineId' })
  machine: Machine;

  @Column('decimal', { precision: 5, scale: 1 })
  temperature: number;

  @Column('decimal', { precision: 4, scale: 1 })
  pressure: number;

  @Column()
  status: string;

  @Column({ type: 'timestamp' })
  @Index()
  timestamp: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}


