import { Module } from '@nestjs/common'
import { utilities, WinstonModule } from 'nest-winston'
import { ConfigService } from '@nestjs/config'
import * as winston from 'winston'
import { Console } from 'winston/lib/winston/transports'
import DailyRotateFile from 'winston-daily-rotate-file'

@Module({
    imports: [
        WinstonModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const consoleTransports = new Console({
                    level: 'debug',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        utilities.format.nestLike()
                    ),
                })
                const dailyTransports = new DailyRotateFile({
                    level: configService.get('log.level'),
                    dirname: 'logs',
                    filename: 'application-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '10m',
                    maxFiles: '30d',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.printf(
                            info =>
                                `${info.timestamp} ${info.level}: ${info.message}`
                        )
                    ),
                })

                return {
                    transports: [
                        ...(configService.get('server.env') === 'development'
                            ? [consoleTransports]
                            : []),
                        ...(configService.get('log.on')
                            ? [dailyTransports]
                            : []),
                    ],
                }
            },
        }),
    ],
})
export class LogModule {}
