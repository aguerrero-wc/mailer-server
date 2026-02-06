import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { Job } from 'bullmq';
import { SendEmailDto } from './dto/send-email.dto';
import { TemplatesService } from '../templates/templates.service';
import { EmailLog, EmailStatus } from '../logging/entities/email-log.entity';

@Processor('email_sending')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly templatesService: TemplatesService,
    @InjectRepository(EmailLog)
    private readonly emailLogRepository: Repository<EmailLog>,
  ) {
    super();
  }

  async process(job: Job<SendEmailDto, void, 'send_transactional_email'>) {
    this.logger.log(`Processing job ${job.id} - send_transactional_email`);

    const dto = job.data;

    const template = await this.templatesService.findBySlug(dto.template);
    if (!template) {
      throw new NotFoundException(`Template not found: ${dto.template}`);
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

      this.logger.log(`Job ${job.id} completed - Email sent to ${dto.to}`);
    } catch (error) {
      await this.emailLogRepository.save({
        recipient: dto.to,
        status: EmailStatus.FAILED,
        errorMessage: error.message,
        templateId: template.id,
      });

      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }
}
