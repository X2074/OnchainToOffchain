import { IsArray, IsOptional, IsString } from 'class-validator';
export class CreateContractDto {
    @IsString()
    readonly address: string;

    @IsString()
    @IsOptional()
    readonly name?: string;

    @IsArray()
    readonly abi: Array<object>;

    @IsString()
    @IsOptional()
    readonly createdHash?: string;
}
