import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Machine } from '../machines/machine.entity';

@Entity('downtime_events')
@Index(['machineId', 'startTime'])
export class DowntimeEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  machineId: string;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machineId' })
  machine: Machine;

  @Column({ type: 'timestamp' })
  @Index()
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'int', nullable: true })
  duration: number; // Duração em minutos

  @Column()
  category: string; // PLANNED, UNPLANNED, BREAKDOWN, MAINTENANCE, SETUP, etc.

  @Column({ nullable: true })
  reason: string; // Motivo da parada

  @Column({ nullable: true })
  description: string; // Descrição detalhada

  @Column({ default: 'ACTIVE' })
  status: string; // ACTIVE, RESOLVED

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

