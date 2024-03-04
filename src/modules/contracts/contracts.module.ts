import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { EventsModule } from '@/modules/events/events.module'
import { ContractsController } from './contracts.controller'
import { ContractsService } from './contracts.service'
import { Contract, ContractSchema } from '@/schema/contract.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contract.name, schema: ContractSchema }], 'qng_mainnet'),
    EventsModule
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService]
})
export class ContractsModule {}
