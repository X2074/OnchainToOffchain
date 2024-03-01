import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from '@/schema/event.schema';
@Injectable()
export class EventsService {
    constructor(
        @InjectModel(Event.name, 'qng_mainnet')
        private eventModel: Model<EventDocument>
    ) {}
}
