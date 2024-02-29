import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { Contract, ContractSchema } from '@/schema/contract.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Contract', schema: ContractSchema, collection: 'contract'}],'qng_mainnet'),
    ],
    controllers: [ContractController],
    providers: [ContractService],
})
export class ContractModule {}
