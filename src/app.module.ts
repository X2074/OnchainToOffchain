import { Global, Logger, Module } from '@nestjs/common';
import { HomeModule } from '@/modules/home/home.module';
import { ContractsModule } from '@/modules/contracts/contracts.module';
import { EventsModule } from '@/modules/events/events.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getConfig } from './config';
import { LogModule } from '@/log/log.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from "@/tasks/tasks.module";
import { CacheModule } from "@nestjs/cache-manager";

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            load: [getConfig],
        }),
        CacheModule.register(),
        MongooseModule.forRootAsync({
            connectionName: 'qng_mainnet',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const mongoUri = configService.get<string>('mongo_connection_uri');
                return {
                    uri: mongoUri,
                };
            },
        }),
        HomeModule,
        ContractsModule,
        EventsModule,
        LogModule,
        ScheduleModule.forRoot(),
        TasksModule
    ],
    controllers: [],
    providers: [Logger],
    exports: [Logger],
})
export class AppModule {}
