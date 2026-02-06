import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { TemplatesModule } from '../templates/templates.module';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [TemplatesModule, LoggingModule],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
