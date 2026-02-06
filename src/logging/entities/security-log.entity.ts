import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('security_logs')
export class SecurityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  eventType: string;

  @Column()
  sourceIp: string;

  @Column()
  endpoint: string;

  @Column()
  method: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  @Column()
  description: string;
}
