import { Controller, Post, Body } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('test')
export class TestController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('email')
  async sendTestEmail(@Body('to') to: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Test Email from Mailer Service',
      text: 'This is a test email sent from the NestJS mailer service.',
      html: '<p>This is a <strong>test email</strong> sent from the NestJS mailer service.</p>',
    });

    return {
      success: true,
      message: `Email sent successfully to ${to}`,
    };
  }
}
