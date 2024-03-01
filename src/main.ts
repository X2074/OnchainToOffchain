import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from "@nestjs/config";
import { HttpExceptionFilter } from "@/filters/http-exception.filter";
import { BadRequestException, Logger, ValidationPipe } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {});
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    const logger = new Logger()
    app.useGlobalFilters(new HttpExceptionFilter(logger))
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // 如果设置为 true，验证器将去除未使用任何装饰器的属性
        forbidNonWhitelisted: true, // 当请求的数据中存在不在白名单中的属性时，抛出错误
        transform: true, // 自动将有效载荷转换为 DTO 类的实例
        disableErrorMessages: false, // 控制是否显示详细的错误信息
        exceptionFactory: (errors) => {
            const messages = errors.map(error => ({
                property: error.property,
                constraints: error.constraints,
            }));
            return new BadRequestException(messages);
        },
    }))
    const config = new DocumentBuilder()
        .setTitle('Onchain To Offchain Service API Document')
        .setDescription('Onchain To Offchain: A blockchain oriented data synchronization tool that synchronizes on chain transaction data to offline databases, facilitating further development of complex business scenarios.')
        .setVersion('1.0.0')
        .addTag('free')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('document', app, document);
    const configService = app.get(ConfigService);
    const PORT = configService.get<number>('server.port');
    await app.listen(PORT);
    logger.log(`Server run at http://localhost:${PORT}/`)
    logger.log(`Api document: http://localhost:${PORT}/document`)
}
bootstrap();
