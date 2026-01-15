import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Machine } from '../machines/machine.entity';

@Entity('quality_defects')
@Index(['machineId', 'timestamp'])
export class QualityDefect {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  machineId: string;

  @ManyToOne(() => Machine)
  @JoinColumn({ name: 'machineId' })
  machine: Machine;

  @Column({ type: 'timestamp' })
  @Index()
  timestamp: Date;

  @Column()
  defectType: string; // DIMENSION, SURFACE, MATERIAL, ASSEMBLY, etc.

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'int', default: 1 })
  quantity: number; // Quantidade de peças defeituosas

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

