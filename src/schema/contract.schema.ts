import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContractDocument = HydratedDocument<Contract>;

@Schema()
export class Contract {
    @Prop({ type: Number, select: false })
    __v: number;

    @Prop({ type: String, required: true, unique: true })
    address: string;

    @Prop({ type: String, required: false })
    name: string;

    @Prop({ type: Array, required: true, select: false })
    abi: any[];

    @Prop({ type: String, required: false })
    createdBy: string;

    @Prop({ type: String, required: false })
    createdHash: string;

    @Prop({ type: Date, required: false })
    createdTime: Date;

    @Prop({ type: Number, required: false })
    createdBlock: number;

    @Prop({ type: Number, default: 0 })
    lastScannedBlock: number;

    @Prop({ type: Boolean, default: true })
    scannable: boolean;

    @Prop({ type: Boolean, default: false })
    scanning: boolean;
}

export const ContractSchema = SchemaFactory.createForClass(Contract);
