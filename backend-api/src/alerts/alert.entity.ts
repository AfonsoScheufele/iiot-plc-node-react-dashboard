import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('alerts')
@Index(['machineId', 'createdAt'])
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  machineId: string;

  @Column()
  type: string;

  @Column()
  severity: string;

  @Column('text')
  message: string;

  @Column('decimal', { precision: 5, scale: 1, nullable: true })
  temperature?: number;

  @Column('decimal', { precision: 4, scale: 1, nullable: true })
  pressure?: number;

  @Column({ default: false })
  resolved: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;
}



