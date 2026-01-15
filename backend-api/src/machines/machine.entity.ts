import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Metric } from '../metrics/metric.entity';

@Entity('machines')
export class Machine {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'STOPPED' })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Metric, (metric) => metric.machine)
  metrics: Metric[];
}





