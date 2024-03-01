import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContractDto } from './contract.dto';
import { Contract, ContractDocument } from '@/schema/contract.schema';
import { ConfigService } from '@nestjs/config';
import { Web3 } from "web3";

@Injectable()
export class ContractsService {
    constructor(
        @InjectModel(Contract.name, 'qng_mainnet')
        private contractModel: Model<ContractDocument>,
        private configService: ConfigService
    ) {}

    async create(createContractDto: CreateContractDto): Promise<Contract> {
        if (createContractDto.createdHash){
            const httpProvider = new Web3.providers.HttpProvider(this.configService.get<string>('web3.rpc'));
            const web3 = new Web3(httpProvider);
            // 获取合约创建交易的信息
            const transaction = await web3.eth.getTransactionReceipt(createContractDto.createdHash);
            if (transaction && transaction.contractAddress && transaction.contractAddress.toLowerCase() === createContractDto.address.toLowerCase()) {
                // 校验通过时，记录创建人和时间
                const createdBy = transaction.from.toLowerCase();
                const block = await web3.eth.getBlock(transaction.blockNumber)
                const createdTime = new Date(Number(block.timestamp) * 1000)
                const createdContract= await this.contractModel.create({
                    address: createContractDto.address.toLowerCase(),
                    name: createContractDto.name || createContractDto.address.toLowerCase(),
                    abi: createContractDto.abi,
                    createdHash: createContractDto.createdHash,
                    createdBy,
                    createdTime,
                    createdBlock: Number(transaction.blockNumber),
                    lastScannedBlock: Number(transaction.blockNumber)-1
                })
                return createdContract;
            } else {
                // 校验失败时，返回错误信息
                throw new HttpException('Invalid createdHash. It does not match the contract address.', HttpStatus.BAD_REQUEST);
            }
        }else{
            const createdContract= await this.contractModel.create({
                address: createContractDto.address.toLowerCase(),
                name: createContractDto.name || createContractDto.address.toLowerCase(),
                abi: createContractDto.abi
            })
            return createdContract;
        }
    }

    async findAll(page: number, pageSize: number): Promise<{ total: number; contracts: Contract[]; page: number; pageSize: number }> {
        const total = await this.contractModel.countDocuments().exec();
        const contracts = await this.contractModel
            .find()
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .exec();
        return {
            total,
            contracts,
            page,
            pageSize
        };
    }

    async findAllDetail(queryCriteria, selectField): Promise<Contract[]>{
        const contracts = await this.contractModel.find(queryCriteria).select(selectField).exec();
        return contracts
    }

    async findByAddress(address): Promise<Contract>{
        const contract = await this.contractModel.findOne({address: address.toLowerCase()});
        return contract
    }
}
