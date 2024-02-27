import { Global, Logger, Module } from '@nestjs/common';
import { HomeModule } from '@/modules/home/home.module';
import { ConfigModule } from '@nestjs/config';
import { getConfig } from './config';
import { LogModule } from '@/log/log.module';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            load: [getConfig],
        }),
        LogModule,
        HomeModule,
    ],
    controllers: [],
    providers: [Logger],
    exports: [Logger],
})
export class AppModule {}
