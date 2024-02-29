import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContractDto } from './contract.dto';
import { Contract } from '@/schema/contract.schema';
@Injectable()
export class ContractService {
    constructor(@InjectModel('Contract') private readonly contractModel: Model<Contract>) {}

    async create(createContractDto: CreateContractDto): Promise<Contract> {
        const createdContract = new this.contractModel(createContractDto);
        return createdContract.save();
    }

    async findALl(): Promise<Contract[]> {
        return this.contractModel.find().exec();
    }
}
