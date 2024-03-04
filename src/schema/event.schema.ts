import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema()
export class Event {
    @Prop({ type: Number, select: false })
      __v: number

    @Prop({ type: String, required: true, unique: true })
      address: string

    @Prop({ type: Number, require: true })
      blockNumber: number

    @Prop({ type: String, require: true })
      blockHash: string

    @Prop({ type: Date, require: true, index: true })
      time: Date

    @Prop({ type: String, require: true })
      transactionHash: string

    @Prop({ type: Number, require: true })
      transactionIndex: number

    @Prop({ type: Array, require: true })
      topics: string[]

    @Prop({ type: String, require: true })
      data: string

    @Prop({ type: Number, require: true })
      logIndex: number

    @Prop({ type: Boolean, require: true })
      removed: boolean

    @Prop({ type: Object, require: true })
      returnValues: object

    @Prop({ type: String, require: true, index: true })
      event: string

    @Prop({ type: String, require: true })
      signature: string

    @Prop({ type: Array, require: true })
      raw: object[]
}

export type EventDocument = HydratedDocument<Event>;

export const EventSchema = SchemaFactory.createForClass(Event)
