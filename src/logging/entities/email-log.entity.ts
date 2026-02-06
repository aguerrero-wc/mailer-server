import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Template } from '../../templates/entities/template.entity';

export enum EmailStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('email_logs')
export class EmailLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipient: string;

  @CreateDateColumn()
  sentAt: Date;

  @Column({ type: 'varchar', default: EmailStatus.SUCCESS })
  status: EmailStatus;

  @Column({ nullable: true })
  providerId: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Template, (template) => template.emailLogs)
  @JoinColumn({ name: 'templateId' })
  template: Template;

  @Column()
  templateId: string;
}
