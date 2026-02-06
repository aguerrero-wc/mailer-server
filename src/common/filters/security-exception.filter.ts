import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { SecurityLoggerService } from '../../logging/services/security-logger.service';

@Catch(HttpException)
export class SecurityExceptionFilter implements ExceptionFilter {
  private readonly securityStatuses = [401, 403, 404];

  constructor(private readonly securityLoggerService: SecurityLoggerService) {}

  async catch(exception: HttpException, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (this.securityStatuses.includes(status)) {
      await this.securityLoggerService.logSecurityEvent(exception, request);
    }

    const exceptionResponse = exception.getResponse();
    response.status(status).json(exceptionResponse);
  }
}
