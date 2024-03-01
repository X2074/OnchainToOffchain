import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    LoggerService,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

    catch(exception: HttpException, host: ArgumentsHost): any {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        const error = typeof exceptionResponse === 'string'
            ? {message: exceptionResponse}
            : exceptionResponse;
        this.logger.error(exception.message, exception.stack);
        response
            .status(status)
            .json({
                status: status,
                timestamp: new Date().toISOString(),
                path: ctx.getRequest().url,
                ...error,
            });
    }
}
