import { Global, Logger, Module } from '@nestjs/common';
import { HomeModule } from '@/modules/home/home.module';
import { ContractModule } from '@/modules/contract/contract.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getConfig } from './config';
import { LogModule } from '@/log/log.module';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true,
            load: [getConfig],
        }),
        LogModule,
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
        ContractModule,
    ],
    controllers: [],
    providers: [Logger],
    exports: [Logger],
})
export class AppModule {}
