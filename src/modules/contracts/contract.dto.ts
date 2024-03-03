import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";
import { ContractAbi } from "web3/lib/types";

export class CreateContractDto {
    @ApiProperty({
        description: 'The contract address.'
    })
    @IsString()
    readonly address: string;

    @ApiProperty({
        description: 'Naming the contract to help users quickly understand it.',
        required: false
    })
    @IsString()
    @IsOptional()
    readonly name?: string;

    @ApiProperty({
        description: 'The ABI (Application Binary Interface) of the contract, defining how to interact with the contract, including its methods and events.',
        type: 'array',
        items: { type: 'object' },
    })
    @IsArray()
    readonly abi: ContractAbi;

    @ApiProperty({
        description: 'The hash of the transaction that created the contract, helping the system quickly locate the block created by the contract.',
        required: false
    })
    @IsString()
    @IsOptional()
    readonly createdHash?: string;
}

export class UpdateContractDto {
    @ApiProperty({
        description: 'Naming the contract to help users quickly understand it.',
        required: false
    })
    @IsString()
    @IsOptional()
    readonly name?: string;

    @ApiProperty({
        description: 'The ABI of the contract. Optional when updating a contract.',
        type: 'array',
        items: { type: 'object' },
        required: false
    })
    @IsArray()
    @IsOptional()
    readonly abi?: ContractAbi;
}
