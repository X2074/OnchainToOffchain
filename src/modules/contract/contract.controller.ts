import { Body, Controller, Get, Inject, LoggerService, Post } from '@nestjs/common';
import { ContractService } from './contract.service';
import { CreateContractDto } from './contract.dto'
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Contract } from "@/schema/contract.schema";

@Controller('contracts')
export class ContractController {
    constructor(
        private readonly contractService: ContractService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
    ) {
        this.logger.log('Contract Controller init')
    }

    @Post()
    async create(@Body() createContractDto: CreateContractDto){
        return this.contractService.create(createContractDto);
    }

    @Get()
    async findAll(): Promise<Contract[]> {
        return this.contractService.findALl();
    }
}
