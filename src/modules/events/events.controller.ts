import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    LoggerService,
    Post,
    Query,
} from '@nestjs/common'
import { EventsService } from './events.service'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { Event } from '@/schema/event.schema'
import { QueryEventDto, StatisticsEventDto } from './event.dto'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
dayjs.extend(utc)
dayjs.extend(quarterOfYear)

@ApiTags('events')
@Controller('/events')
export class EventsController {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
        private readonly eventsService: EventsService
    ) {
        this.logger.log('Events Controller init')
    }

    @Get()
    @ApiQuery({
        name: 'address',
        required: true,
        description: 'Contract address',
        type: String,
    })
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
    async getAllEvents(
        @Query('address') address: string,
        @Query('page') page: string = '1',
        @Query('pageSize') pageSize: string = '10'
    ): Promise<{
        total: number
        events: Event[]
        page: number
        pageSize: number
    }> {
        if (!address) {
            throw new HttpException(
                'Address is required',
                HttpStatus.BAD_REQUEST
            )
        }
        const pageNumber = parseInt(page, 10) || 1
        const pageSizeNumber = parseInt(pageSize, 10) || 10
        return this.eventsService.findByAddress(
            address,
            pageNumber,
            pageSizeNumber
        )
    }

    @Post('query')
    async getEvents(
        @Body() queryEventDto: QueryEventDto
    ): Promise<{
        total: number
        events: Event[]
        page: number
        pageSize: number
    }> {
        const queryCriteria = queryEventDto.queryCriteria
        queryCriteria.address = queryCriteria.address.toLowerCase()
        if (!queryCriteria?.time) {
            // 原有的查询条件对time没有约束时，加入时间范围条件
            const endTime = queryEventDto.endTime
                ? dayjs.utc(queryEventDto.endTime).toDate()
                : dayjs.utc().toDate() // 没有提供结束时间时默认使用当前时间
            const startTime = queryEventDto.startTime
                ? dayjs.utc(queryEventDto.startTime).toDate()
                : dayjs.utc(endTime).subtract(6, 'day').startOf('day').toDate() // 没有提供结束时间时默认使用结束时间前7天的0点时间（也就是默认查询七天的数据）
            queryCriteria.time = { $gte: startTime, $lte: endTime }
        }
        const selectField = queryEventDto.selectField
            ? queryEventDto.selectField
            : ''
        const sortCriteria = queryEventDto.sortCriteria
            ? queryEventDto.sortCriteria
            : { time: -1 }
        const page = queryEventDto.page ? queryEventDto.page : 1
        const pageSize = queryEventDto.pageSize ? queryEventDto.pageSize : 10
        return this.eventsService.find(
            queryCriteria,
            selectField,
            sortCriteria,
            page,
            pageSize
        )
    }

    @Post('statistics')
    async getEventsStatistics(@Body() statisticsEventDto: StatisticsEventDto) {
        const queryCriteria = statisticsEventDto.queryCriteria
        queryCriteria.address = queryCriteria.address.toLowerCase()

        const unit = statisticsEventDto.unit
            ? statisticsEventDto.unit.toLowerCase()
            : 'day'
        const endTime = statisticsEventDto.endTime
            ? dayjs.utc(statisticsEventDto.endTime).toDate()
            : dayjs.utc().toDate() // 没有提供结束时间时默认使用当前时间
        let startTime = endTime
        if (statisticsEventDto.startTime) {
            startTime = dayjs.utc(statisticsEventDto.startTime).toDate()
        } else {
            switch (unit) {
                case 'year':
                    startTime = dayjs
                        .utc(endTime)
                        .subtract(3, 'year')
                        .startOf('year')
                        .toDate()
                    break
                case 'quarter':
                    startTime = dayjs
                        .utc(endTime)
                        .subtract(3, 'quarter')
                        .startOf('quarter')
                        .toDate()
                    break
                case 'month':
                    startTime = dayjs
                        .utc(endTime)
                        .subtract(3, 'month')
                        .startOf('month')
                        .toDate()
                    break
                case 'week':
                    startTime = dayjs
                        .utc(endTime)
                        .subtract(3, 'week')
                        .startOf('week')
                        .toDate()
                    break
                case 'day':
                    startTime = dayjs
                        .utc(endTime)
                        .subtract(6, 'day')
                        .startOf('day')
                        .toDate()
                    break
                case 'hour':
                    startTime = dayjs
                        .utc(endTime)
                        .subtract(24, 'hour')
                        .startOf('hour')
                        .toDate()
                    break
                default: // 默认按天处理
                    startTime = dayjs
                        .utc(endTime)
                        .subtract(6, 'day')
                        .startOf('day')
                        .toDate()
                    break
            }
        }
        queryCriteria.time = { $gte: startTime, $lte: endTime }
        const groupField = statisticsEventDto.groupField
            ? statisticsEventDto.groupField
            : ''

        const options = statisticsEventDto.options // 统计操作的描述（count/sum/average/min/max） 例如: { "returnValues.creator":"count","returnValues.metadata.royaltyFraction":"sum"}
        return this.eventsService.getEventsStatistics(
            queryCriteria,
            groupField,
            unit,
            startTime,
            endTime,
            options
        )
    }
}
