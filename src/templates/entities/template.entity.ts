import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { EmailLog } from '../../logging/entities/email-log.entity';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column()
  filename: string;

  @Column()
  subject: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => EmailLog, (emailLog) => emailLog.template)
  emailLogs: EmailLog[];
}
