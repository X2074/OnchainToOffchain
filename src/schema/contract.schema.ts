import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { ContractAbi } from 'web3/lib/types'

@Schema()
export class Contract {
    @Prop({ type: String, required: true, unique: true })
    address: string

    @Prop({ type: String, required: false })
    name: string

    @Prop({ type: Array, required: true, select: false })
    abi: ContractAbi

    @Prop({ type: String, required: false })
    createdBy: string

    @Prop({ type: String, required: false })
    createdHash: string

    @Prop({ type: Date, required: false })
    createdTime: Date

    @Prop({ type: Number, required: false })
    createdBlock: number

    @Prop({ type: Number, default: 0 })
    lastScannedBlock: number

    @Prop({ type: Boolean, default: true })
    scannable: boolean

    @Prop({ type: Boolean, default: false })
    scanning: boolean
}

export type ContractDocument = HydratedDocument<Contract>
export const ContractSchema = SchemaFactory.createForClass(Contract)
