import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Machine } from '../machines/machine.entity';

@Entity('production_runs')
@Index(['machineId', 'startTime'])
export class ProductionRun {
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

  @Column({ type: 'int', default: 0 })
  plannedProduction: number; // Quantidade planejada

  @Column({ type: 'int', default: 0 })
  actualProduction: number; // Quantidade produzida

  @Column({ type: 'int', default: 0 })
  goodParts: number; // Peças boas

  @Column({ type: 'int', default: 0 })
  defectiveParts: number; // Peças defeituosas

  @Column({ type: 'int', default: 0 })
  plannedTime: number; // Tempo planejado em minutos

  @Column({ type: 'int', default: 0 })
  operatingTime: number; // Tempo operacional em minutos

  @Column({ type: 'int', default: 0 })
  downtime: number; // Tempo de parada em minutos

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  availability: number; // Disponibilidade (%)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  performance: number; // Performance (%)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  quality: number; // Qualidade (%)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  oee: number; // OEE geral (%)

  @Column({ default: 'RUNNING' })
  status: string; // RUNNING, COMPLETED, CANCELLED

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

