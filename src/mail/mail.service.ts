import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { SendRecoveryDto } from './dto/send-recovery.dto';
import { TemplatesService } from '../templates/templates.service';
import { EmailLog, EmailStatus } from '../logging/entities/email-log.entity';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly templatesService: TemplatesService,
    @InjectRepository(EmailLog)
    private readonly emailLogRepository: Repository<EmailLog>,
  ) {}

  async sendPasswordRecovery(dto: SendRecoveryDto): Promise<void> {
    const template = await this.templatesService.findBySlug('password_recovery');
    if (!template) {
      throw new NotFoundException('Template password_recovery not found');
    }

    try {
      const result = await this.mailerService.sendMail({
        to: dto.email,
        subject: template.subject,
        template: `./${template.filename}`,
        context: {
          name: dto.name,
          url: dto.url,
        },
      });

      await this.emailLogRepository.save({
        recipient: dto.email,
        status: EmailStatus.SUCCESS,
        providerId: result.messageId,
        templateId: template.id,
      });
    } catch (error) {
      await this.emailLogRepository.save({
        recipient: dto.email,
        status: EmailStatus.FAILED,
        errorMessage: error.message,
        templateId: template.id,
      });

      throw error;
    }
  }
}
