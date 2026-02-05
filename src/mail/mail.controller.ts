import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendRecoveryDto } from './dto/send-recovery.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('recovery')
  async sendRecoveryEmail(@Body() dto: SendRecoveryDto) {
    await this.mailService.sendPasswordRecovery(dto);
    return {
      success: true,
      message: `Email de recuperación enviado a ${dto.email}`,
    };
  }
}
