import {
    IsArray,
    IsOptional,
    IsString,
    IsNumber,
    IsDate,
    IsBoolean,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ContractAbi } from 'web3/lib/types'

export class CreateContractDto {
    @ApiProperty({
        description: 'The contract address.',
    })
    @IsString()
    readonly address: string

    @ApiProperty({
        description: 'Naming the contract to help users quickly understand it.',
        required: false,
    })
    @IsString()
    @IsOptional()
    readonly name?: string

    @ApiProperty({
        description:
            'The ABI (Application Binary Interface) of the contract, defining how to interact with the contract, including its methods and events.',
        type: 'array',
        items: { type: 'object' },
    })
    @IsArray()
    readonly abi: ContractAbi

    @ApiProperty({
        description:
            'The hash of the transaction that created the contract, helping the system quickly locate the block created by the contract.',
        required: false,
    })
    @IsString()
    @IsOptional()
    readonly createdHash?: string
}

export class UpdateContractDto {
    @ApiProperty({
        description: 'Naming the contract to help users quickly understand it.',
        required: false,
    })
    @IsString()
    @IsOptional()
    readonly name?: string

    @ApiProperty({
        description:
            'The ABI of the contract. Optional when updating a contract.',
        type: 'array',
        items: { type: 'object' },
        required: false,
    })
    @IsArray()
    @IsOptional()
    readonly abi?: ContractAbi

    @ApiProperty({
        description: 'Whether the contract is marked for scanning.',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    readonly scannable?: boolean

    @ApiProperty({
        description: 'Whether the contract is currently being scanned.',
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    readonly scanning?: boolean

    @ApiProperty({
        description:
            'The last block number scanned by the system for this contract.',
        required: false,
    })
    @IsNumber()
    @IsOptional()
    readonly lastScannedBlock?: number
}

export class ContractSummaryDto {
    @ApiProperty({
        description: 'The contract address.',
    })
    @IsString()
    readonly address: string

    @ApiProperty({
        description: 'Naming the contract to help users quickly understand it.',
        required: false,
    })
    @IsString()
    @IsOptional()
    readonly name?: string

    @ApiProperty({
        description: 'Identifier of the user who created the contract.',
        required: false,
    })
    @IsString()
    @IsOptional()
    readonly createdBy?: string

    @ApiProperty({
        description:
            'The hash of the transaction that created the contract, helping the system quickly locate the block created by the contract.',
        required: false,
    })
    @IsString()
    @IsOptional()
    readonly createdHash?: string

    @ApiProperty({
        description: 'The time when the contract was created.',
        type: 'string',
        format: 'date-time',
        required: false,
    })
    @IsDate()
    @IsOptional()
    readonly createdTime?: Date

    @ApiProperty({
        description: 'The block number in which the contract was created.',
        required: false,
    })
    @IsNumber()
    readonly createdBlock: number

    @ApiProperty({
        description:
            'The last block number scanned by the system for this contract.',
        required: false,
    })
    @IsNumber()
    readonly lastScannedBlock: number

    @ApiProperty({
        description: 'Whether the contract is marked for scanning.',
        required: false,
    })
    @IsBoolean()
    readonly scannable: boolean

    @ApiProperty({
        description: 'Whether the contract is currently being scanned.',
        required: false,
    })
    @IsBoolean()
    readonly scanning: boolean
}
