import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { FormatService } from '@/utils/format.service';
import { ContractsModule } from '@/modules/contracts/contracts.module';
import { EventsModule } from '@/modules/events/events.module';

@Module({
    imports: [ContractsModule, EventsModule],
    providers: [TasksService, FormatService],
})
export class TasksModule {}
