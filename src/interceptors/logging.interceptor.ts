import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    LoggerService
} from '@nestjs/common';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor (private readonly logger: LoggerService) {}

    intercept(context: ExecutionContext, next: CallHandler){
        const now = Date.now();
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.url;

        return next
            .handle()
            .pipe(
                tap(() => {
                    const response = context.switchToHttp().getResponse();
                    const statusCode = response.statusCode;
                    const delay = Date.now() - now;
                    this.logger.log(`${method} ${url} ${statusCode} ${delay}ms`);
                }),
            );
    }
}
