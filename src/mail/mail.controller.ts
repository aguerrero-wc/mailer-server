import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendEmailDto } from './dto/send-email.dto';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('mail')
@UseGuards(ApiKeyGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED)
  async sendEmail(@Body() dto: SendEmailDto) {
    const { jobId } = await this.mailService.queueEmail(dto);
    return {
      message: 'Queued',
      jobId,
    };
  }
}
