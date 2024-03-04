import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { EventsController } from './events.controller'
import { EventsService } from './events.service'
import { Event, EventSchema } from '@/schema/event.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }], 'qng_mainnet')
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService]
})
export class EventsModule {}
