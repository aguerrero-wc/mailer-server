import { Injectable, HttpException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { SecurityLog } from '../entities/security-log.entity';

@Injectable()
export class SecurityLoggerService {
  private readonly logger = new Logger(SecurityLoggerService.name);

  constructor(
    @InjectRepository(SecurityLog)
    private readonly securityLogRepository: Repository<SecurityLog>,
  ) {}

  async logSecurityEvent(exception: HttpException, request: Request): Promise<void> {
    try {
      const status = exception.getStatus();
      const eventType = this.getEventType(status);

      const securityLog = this.securityLogRepository.create({
        eventType,
        sourceIp: this.extractIp(request),
        endpoint: request.originalUrl || request.url,
        method: request.method,
        payload: request.body && Object.keys(request.body).length > 0 ? request.body : null,
        description: exception.message,
      });

      await this.securityLogRepository.save(securityLog);
      this.logger.warn(`Security event logged: ${eventType} - ${request.method} ${request.url}`);
    } catch (error) {
      this.logger.error('Failed to log security event', error.stack);
    }
  }

  private getEventType(status: number): string {
    switch (status) {
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      default:
        return 'UNKNOWN';
    }
  }

  private extractIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.ip || request.socket?.remoteAddress || 'unknown';
  }
}
