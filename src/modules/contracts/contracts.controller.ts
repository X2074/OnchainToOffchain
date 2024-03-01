import { Body, Query, Controller, Get, Post, Inject, LoggerService, HttpException, HttpStatus } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './contract.dto'
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Contract } from "@/schema/contract.schema";
import { ApiQuery, ApiTags } from "@nestjs/swagger";

@ApiTags('contracts')
@Controller('contracts')
export class ContractsController {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
        private readonly contractsService: ContractsService,
    ) {
        this.logger.log('Contracts Controller init')
    }

    @Post()
    async create(@Body() createContractDto: CreateContractDto){
        const repeatedContract = await this.contractsService.findByAddress(createContractDto.address)
        if (repeatedContract) {
            throw new HttpException(`Contract:${createContractDto.address} already exists`, HttpStatus.CONFLICT);
        }
        return this.contractsService.create(createContractDto);
    }

    @Get()
    @ApiQuery({ name: 'page', required: false, description: 'Page number of the results to fetch', type: Number, example: 1 })
    @ApiQuery({ name: 'pageSize', required: false, description: 'Number of results per page', type: Number, example: 10 })
    async findAll(
        @Query('page') page: string,
        @Query('pageSize') pageSize: string
    ): Promise<{ total: number; contracts: Contract[]; page: number; pageSize: number }> {
        const pageNumber = parseInt(page, 10) || 1;
        const pageSizeNumber = parseInt(pageSize, 10) || 10;
        return this.contractsService.findAll(pageNumber, pageSizeNumber);
    }
}
