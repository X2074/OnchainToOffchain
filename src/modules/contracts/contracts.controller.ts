import {
    Body,
    Query,
    Controller,
    Get,
    Post,
    Delete,
    Inject,
    LoggerService,
    HttpException,
    HttpStatus,
    Param,
} from '@nestjs/common'
import { ContractsService } from './contracts.service'
import { CreateContractDto, UpdateContractDto } from './contract.dto'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { Contract } from '@/schema/contract.schema'
import {
    ApiQuery,
    ApiTags,
    ApiBody,
    ApiParam,
    ApiOperation,
} from '@nestjs/swagger'

@ApiTags('contracts')
@Controller('contracts')
export class ContractsController {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
        private readonly contractsService: ContractsService
    ) {
        this.logger.log('Contracts Controller init')
    }

    @Post()
    @ApiOperation({ summary: 'Register a new contract to be collected' })
    @ApiBody({ type: CreateContractDto, description: 'Contract data' })
    async create(@Body() createContractDto: CreateContractDto) {
        const repeatedContract = await this.contractsService.findOne(
            createContractDto.address
        )
        if (repeatedContract) {
            throw new HttpException(
                `Contract:${createContractDto.address} already exists`,
                HttpStatus.CONFLICT
            )
        }
        return this.contractsService.create(createContractDto)
    }

    @Get()
    @ApiQuery({
        name: 'page',
        required: false,
        description: 'Page number of the results to fetch',
        type: Number,
        example: 1,
    })
    @ApiQuery({
        name: 'pageSize',
        required: false,
        description: 'Number of results per page',
        type: Number,
        example: 10,
    })
    async findAll(
        @Query('page') page: string,
        @Query('pageSize') pageSize: string
    ): Promise<{
        total: number
        contracts: Contract[]
        page: number
        pageSize: number
    }> {
        const pageNumber = parseInt(page, 10) || 1
        const pageSizeNumber = parseInt(pageSize, 10) || 10
        return this.contractsService.findAll(pageNumber, pageSizeNumber)
    }

    @Get(':address')
    @ApiParam({
        name: 'address',
        required: true,
        description: 'Contract address',
        type: String,
    })
    async findOne(@Param('address') address: string): Promise<Contract> {
        return this.contractsService.findOne(address)
    }

    @Get(':address/detail')
    @ApiParam({
        name: 'address',
        required: true,
        description: 'Contract address',
        type: String,
    })
    async findOneDetail(@Param('address') address: string): Promise<Contract> {
        return this.contractsService.findOneDetail(address)
    }

    @Delete(':address')
    @ApiParam({
        name: 'address',
        required: true,
        description: 'Contract address',
        type: String,
    })
    async delete(@Param('address') address: string): Promise<Contract> {
        return this.contractsService.delete(address)
    }

    @Post(':address')
    @ApiParam({
        name: 'address',
        required: true,
        description: 'Contract address',
        type: String,
    })
    @ApiBody({ type: UpdateContractDto, description: 'Contract data' })
    async update(
        @Param('address') address: string,
        @Body() updateContractDto: UpdateContractDto
    ): Promise<Contract> {
        return this.contractsService.update(address, updateContractDto)
    }

    @Post(':address/scanning/start')
    @ApiParam({
        name: 'address',
        required: true,
        description: 'Contract address',
        type: String,
    })
    async startScanning(@Param('address') address: string): Promise<Contract> {
        return this.contractsService.startScanning(address)
    }

    @Post(':address/scanning/stop')
    @ApiParam({
        name: 'address',
        required: true,
        description: 'Contract address',
        type: String,
    })
    async sopScanning(@Param('address') address: string): Promise<Contract> {
        return this.contractsService.stopScanning(address)
    }

    @Post(':address/events/clear')
    @ApiParam({
        name: 'address',
        required: true,
        description: 'Contract address',
        type: String,
    })
    async clearEvents(@Param('address') address: string): Promise<Contract> {
        return this.contractsService.clearEvents(address)
    }
}
