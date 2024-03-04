import { IsOptional, IsString, IsObject, IsNumber, ValidateNested, IsArray, IsDefined, IsIn } from 'class-validator'
import { Type } from 'class-transformer'

class QueryCriteria {
    @IsDefined({ message: 'The query criteria must include contract address information.' })
    @IsString()
      address: string

    @IsObject()
    @IsOptional()
      time?: object
}
export class QueryEventDto {
    @IsObject()
    @ValidateNested()
    @Type(() => QueryCriteria)
  readonly queryCriteria: QueryCriteria

    @IsString()
    @IsOptional()
    readonly selectField?: string = ''

    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => Object)
    readonly sortCriteria?: object = { time: -1 }

    @IsString()
    @IsOptional()
    readonly startTime?: string

    @IsString()
    @IsOptional()
    readonly endTime?: string

    @IsNumber()
    @IsOptional()
    readonly page: number = 1

    @IsNumber()
    @IsOptional()
    readonly pageSize: number = 10
}
export class StatisticsEventDto {
    @IsObject()
    @ValidateNested()
    @Type(() => QueryCriteria)
  readonly queryCriteria: QueryCriteria

    @IsObject()
    @ValidateNested()
    @Type(() => Object)
    readonly options: object

    @IsString()
    @IsOptional()
    @IsIn(['all', 'hour', 'day', 'week', 'month', 'quarter', 'year'], { message: 'Unit must be one of the following: all, hour, day, week, month, quarter, year.' })
    readonly unit: string = 'day'

    @IsArray()
    @IsOptional()
    @Type(() => String)
    readonly groupField?: string[] = []

    @IsString()
    @IsOptional()
    readonly startTime?: string

    @IsString()
    @IsOptional()
    readonly endTime?: string
}
