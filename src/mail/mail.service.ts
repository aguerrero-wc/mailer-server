import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendRecoveryDto } from './dto/send-recovery.dto';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordRecovery(dto: SendRecoveryDto): Promise<void> {
    await this.mailerService.sendMail({
      to: dto.email,
      subject: 'Recuperación de Clave',
      template: './password-recovery',
      context: {
        name: dto.name,
        url: dto.url,
      },
    });
  }
}
