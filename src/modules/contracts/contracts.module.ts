import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { Contract, ContractSchema } from '@/schema/contract.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{name: Contract.name, schema: ContractSchema}],'qng_mainnet'),
    ],
    controllers: [ContractsController],
    providers: [ContractsService],
})
export class ContractsModule {}
