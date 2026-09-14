import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SendEmailDto } from './dto/send-email.dto';
import { TemplatesService } from '../templates/templates.service';

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('email_sending')
    private readonly emailQueue: Queue,
    private readonly templatesService: TemplatesService,
  ) {}

  async queueEmail(dto: SendEmailDto): Promise<{ jobId: string }> {
    
    
    const template = await this.templatesService.findBySlug(dto.template);
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const job = await this.emailQueue.add('send_transactional_email', dto, {
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
    });

    return { jobId: job.id! };
  }
}
