import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailProcessor } from './mail.processor';
import { TemplatesModule } from '../templates/templates.module';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [
    TemplatesModule,
    LoggingModule,
    BullModule.registerQueue({
      name: 'email_sending',
    }),
  ],
  controllers: [MailController],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
