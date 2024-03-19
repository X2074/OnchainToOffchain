import { Test } from '@nestjs/testing'
import { EventsController } from '../events.controller'
import { EventsService } from '../events.service'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { HttpException } from '@nestjs/common'
import { mockEvents } from '@/mocks/event.mock'
import { QueryEventDto, StatisticsEventDto } from '@/modules/events/event.dto'
import { mockContract1 } from '@/mocks/contract.mock'

describe('ContractsController', () => {
    let eventsService: EventsService
    let eventsController: EventsController

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [EventsController],
            providers: [
                {
                    provide: EventsService,
                    useValue: {
                        findByAddress: jest.fn(),
                        find: jest.fn(),
                        getEventsStatistics: jest.fn(),
                    },
                },
                {
                    provide: WINSTON_MODULE_NEST_PROVIDER,
                    useValue: {
                        log: jest.fn(),
                        error: jest.fn(),
                        warn: jest.fn(),
                        debug: jest.fn(),
                        verbose: jest.fn(),
                    },
                },
            ],
        }).compile()
        eventsService = await moduleRef.resolve(EventsService)
        eventsController = await moduleRef.resolve(EventsController)
    })

    it('should be defined', () => {
        expect(eventsService).toBeDefined()
    })

    it('should be defined', () => {
        expect(eventsController).toBeDefined()
    })

    describe('getAllEvents', () => {
        it('should call eventsService.findByAddress with the correct parameters', async () => {
            const expectedResult = {
                total: mockEvents.length,
                events: mockEvents,
                page: 1,
                pageSize: 10,
            }
            const findByAddressSpy = jest
                .spyOn(eventsService, 'findByAddress')
                .mockResolvedValue(expectedResult)

            const address = '0x123'
            const page = '1'
            const pageSize = '10'
            const result = await eventsController.getAllEvents(
                address,
                page,
                pageSize
            )

            expect(findByAddressSpy).toHaveBeenCalledWith(address, 1, 10)
            expect(result.events).toEqual(mockEvents)
            expect(result.page).toEqual(1)
            expect(result.pageSize).toEqual(10)
        })

        it('should throw HttpException when address is not provided', async () => {
            await expect(
                eventsController.getAllEvents('', '1', '10')
            ).rejects.toThrow(HttpException)
        })
    })

    describe('getEvents', () => {
        it('should return an array of events', async () => {
            const expectedResult = {
                total: mockEvents.length>10 ? 10 : mockEvents.length,
                events: mockEvents.length>10 ? mockEvents.slice(1,10) : mockEvents,
                page: 1,
                pageSize: 10,
            }
            jest.spyOn(eventsService, 'find').mockImplementation(
                async () => expectedResult
            )

            const queryEventDto: QueryEventDto = {
                queryCriteria: {
                    address: mockContract1.address,
                },
                page: 1,
                pageSize: 10,
            }
            expect(await eventsController.getEvents(queryEventDto)).toEqual(
                expectedResult
            )
        })
    })

    describe('getEventsStatistics', () => {
        it('should return statistics of events', async () => {
            const mockStatistics = [
                { key: '2021-01', value: 5 },
                { key: '2021-02', value: 5 },
            ]
            jest.spyOn(eventsService, 'getEventsStatistics').mockImplementation(
                async () => mockStatistics
            )

            const statisticsEventDto: StatisticsEventDto = {
                queryCriteria: {
                    address: '0x15e1d56e0Dc4D6e157B5E00376DFE2520FBE7e06',
                    event: { $in: ['BuyDIM', 'SwapDIM'] },
                },
                startTime: '2023-06-10T00:55:16.000Z',
                endTime: '2023-07-31T00:55:16.000Z',
                unit: 'day',
                options: {
                    'returnValues.buyer': 'count',
                    'returnValues.payAmount': 'sum',
                    'returnValues.tokenAmount': 'sum',
                },
            }
            expect(
                await eventsController.getEventsStatistics(statisticsEventDto)
            ).toEqual(mockStatistics)
        })
    })
})
