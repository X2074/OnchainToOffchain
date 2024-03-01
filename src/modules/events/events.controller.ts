import { Body, Controller, Get, Inject, LoggerService, Post } from '@nestjs/common';
import { EventsService } from './events.service';
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Event } from "@/schema/event.schema";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('events')
@Controller('events')
export class EventsController {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
        private readonly eventsService: EventsService,
    ) {
        this.logger.log('Events Controller init')
    }
}
