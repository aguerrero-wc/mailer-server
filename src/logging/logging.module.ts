import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailLog } from './entities/email-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailLog])],
  exports: [TypeOrmModule],
})
export class LoggingModule {}
