import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from "@nestjs/config";
import { HttpExceptionFilter } from "@/filters/http-exception.filter";
import { Logger, ValidationPipe } from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {});
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    const logger = new Logger()
    app.useGlobalFilters(new HttpExceptionFilter(logger))
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
    }))
    const config = new DocumentBuilder()
        .setTitle('DimAI Crypto Service API Document')
        .setDescription('DimAI Crypto Service: Providing services using official private keys for DimAI.')
        .setVersion('1.0.0')
        .addTag('free')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('document', app, document);
    const configService = app.get(ConfigService);
    const PORT = configService.get<number>('server.port');
    await app.listen(PORT);
    logger.log(`Server run at http://localhost:${PORT}/`)
}
bootstrap();
