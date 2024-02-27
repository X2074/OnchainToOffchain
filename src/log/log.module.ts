import { Module } from '@nestjs/common';
import { utilities, WinstonModule, WinstonModuleOptions } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { Console } from 'winston/lib/winston/transports';
import 'winston-daily-rotate-file';
import DailyRotateFile from 'winston-daily-rotate-file';

const consoleTransports = new Console({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    utilities.format.nestLike(),
  ),
});
const dailyTransports = new DailyRotateFile({
  level: 'warn',
  dirname: 'logs',
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
  ),
});
const dailyInfoTransports = new DailyRotateFile({
  level: 'info',
  dirname: 'logs',
  filename: 'info-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: '14d',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
  ),
});

@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          transports: [
            consoleTransports,
            ...(configService.get('log.on')
              ? [dailyTransports, dailyInfoTransports]
              : []),
          ],
        }) as WinstonModuleOptions,
    }),
  ],
})
export class LogModule {}
