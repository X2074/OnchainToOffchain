import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ContractSummaryDto, CreateContractDto, UpdateContractDto } from './contract.dto'
import { Contract, ContractDocument } from '@/schema/contract.schema'
import { ConfigService } from '@nestjs/config'
import { EventsService } from '@/modules/events/events.service'
import { Web3 } from 'web3'

@Injectable()
export class ContractsService {
    private readonly rpc: string
    private readonly web3: Web3

    constructor(
        @InjectModel(Contract.name, 'qng_mainnet')
        private readonly contractModel: Model<ContractDocument>,
        private readonly configService: ConfigService,
        private readonly eventsService: EventsService
    ) {
        this.rpc = this.configService.get<string>('web3.rpc')
        const httpProvider = new Web3.providers.HttpProvider(this.rpc)
        this.web3 = new Web3(httpProvider)
    }

    async create(createContractDto: CreateContractDto): Promise<Contract> {
        if (createContractDto.createdHash) {
            // 获取合约创建交易的信息
            const transaction = await this.web3.eth.getTransactionReceipt(
                createContractDto.createdHash
            )
            if (
                transaction &&
                transaction.contractAddress &&
                transaction.contractAddress.toLowerCase() ===
                    createContractDto.address.toLowerCase()
            ) {
                // 校验通过时，记录创建人和时间
                const createdBy = transaction.from.toLowerCase()
                const block = await this.web3.eth.getBlock(
                    transaction.blockNumber
                )
                const createdTime = new Date(Number(block.timestamp) * 1000)
                return this.contractModel.create({
                    address: createContractDto.address.toLowerCase(),
                    name:
                        createContractDto.name ||
                        createContractDto.address.toLowerCase(),
                    abi: createContractDto.abi,
                    createdHash: createContractDto.createdHash,
                    createdBy,
                    createdTime,
                    createdBlock: Number(transaction.blockNumber),
                    lastScannedBlock: Number(transaction.blockNumber) - 1,
                })
            } else {
                // 校验失败时，返回错误信息
                throw new HttpException(
                    'Invalid createdHash. It does not match the contract address.',
                    HttpStatus.BAD_REQUEST
                )
            }
        } else {
            return this.contractModel.create({
                address: createContractDto.address.toLowerCase(),
                name:
                    createContractDto.name ||
                    createContractDto.address.toLowerCase(),
                abi: createContractDto.abi,
            })
        }
    }

    async findAll(
        page: number,
        pageSize: number
    ): Promise<{
        total: number
        contracts: ContractSummaryDto[]
        page: number
        pageSize: number
    }> {
        const total = await this.contractModel.countDocuments().exec()
        const contracts = await this.contractModel
            .find()
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .exec()
        return {
            total,
            contracts,
            page,
            pageSize,
        }
    }

    async findAllDetail(queryCriteria: object, selectField: string): Promise<Contract[]> {
        return this.contractModel
            .find(queryCriteria)
            .select(selectField)
            .exec()
    }

    async findOne(address: string): Promise<ContractSummaryDto> {
        return this.contractModel
            .findOne({ address: address.toLowerCase() })
            .exec()
    }

    async findOneDetail(address: string): Promise<Contract> {
        return this.contractModel
            .findOne({ address: address.toLowerCase() })
            .select('+abi')
            .exec()
    }

    async delete(address: string): Promise<Contract> {
        const contractExists = await this.findOne(address)
        if (!contractExists) {
            throw new NotFoundException(
                `Contract with address ${address} not found.`
            );
        }
        const deletedContract = await this.contractModel
            .findOneAndDelete({ address: address.toLowerCase() })
            .select('+abi')
            .exec()
        await this.eventsService.deleteByAddress(address)
        return deletedContract
    }

    async update(address: string, contractData: UpdateContractDto): Promise<Contract> {
        const contractExists = await this.findOne(address)
        if (!contractExists) {
            throw new NotFoundException(
                `Contract with address ${address} not found.`
            );
        }
        return this.contractModel
            .findOneAndUpdate(
                { address: address.toLowerCase() },
                contractData,
                { new: true }
            )
            .select('+abi')
            .exec()
    }

    async startScanning(address: string): Promise<ContractSummaryDto> {
        return this.update(address,{ scannable: true })
    }

    async stopScanning(address: string): Promise<ContractSummaryDto> {
        return this.update(address,{ scannable: false })
    }

    async clearEvents(address: string): Promise<ContractSummaryDto> {
        const contractExists = await this.findOne(address)
        if (!contractExists) {
            throw new NotFoundException(
                `Contract with address ${address} not found.`
            );
        }
        const scannable = contractExists.scannable
        // 如果原先服务未停止，暂停事件扫描任务
        if (scannable) {
            await this.stopScanning(address)
        }
        await this.eventsService.deleteByAddress(address)
        // 更新起始块
        return this.update(address, {
            scannable,
            lastScannedBlock: contractExists.createdBlock ? contractExists.createdBlock : 0,
        })
    }
}
