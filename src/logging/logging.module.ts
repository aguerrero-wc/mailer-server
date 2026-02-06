import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailLog } from './entities/email-log.entity';
import { SecurityLog } from './entities/security-log.entity';
import { SecurityLoggerService } from './services/security-logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmailLog, SecurityLog])],
  providers: [SecurityLoggerService],
  exports: [TypeOrmModule, SecurityLoggerService],
})
export class LoggingModule {}
