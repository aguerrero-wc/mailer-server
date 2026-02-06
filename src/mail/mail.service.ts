import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { SendEmailDto } from './dto/send-email.dto';
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

  async sendEmail(dto: SendEmailDto): Promise<void> {
    const template = await this.templatesService.findBySlug(dto.template);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    try {
      const result = await this.mailerService.sendMail({
        to: dto.to,
        subject: template.subject,
        template: `./${template.filename}`,
        context: dto.data || {},
      });

      await this.emailLogRepository.save({
        recipient: dto.to,
        status: EmailStatus.SUCCESS,
        providerId: result.messageId,
        templateId: template.id,
      });
    } catch (error) {
      await this.emailLogRepository.save({
        recipient: dto.to,
        status: EmailStatus.FAILED,
        errorMessage: error.message,
        templateId: template.id,
      });

      throw error;
    }
  }
}
