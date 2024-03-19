import { Test } from '@nestjs/testing'
import { EventsController } from '../events.controller'
import { EventsService } from '../events.service'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { HttpException } from '@nestjs/common'
import { mockEvents, mockEvent1 } from '@/mocks/event.mock'
import { QueryEventDto, StatisticsEventDto } from '@/modules/events/event.dto'
import { Event } from '@/schema/event.schema'
import { Model } from 'mongoose'
import { getModelToken } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'
import { CreateContractDto } from '@/modules/contracts/contract.dto'

describe('ContractsService', () => {
    let eventsService: EventsService
    let eventModel: Model<Event>

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [],
            providers: [
                EventsService,
                {
                    provide: getModelToken(Event.name, 'qng_mainnet'),
                    useValue: {
                        new: jest.fn().mockResolvedValue(mockEvent1),
                        constructor: jest.fn().mockResolvedValue(mockEvent1),
                        create: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        findOneAndDelete: jest.fn(),
                        findOneAndUpdate: jest.fn(),
                        select: jest.fn(),
                        exec: jest.fn(),
                        countDocuments: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        // 在这里模拟需要的配置项
                        get: jest.fn().mockImplementation((key: string) => {
                            if (key === 'web3.rpc') {
                                return 'https://qng.rpc.qitmeer.io'
                            }
                        }),
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
        eventsService = moduleRef.get<EventsService>(EventsService)
        eventModel = moduleRef.get<Model<Event>>(
            getModelToken(Event.name, 'qng_mainnet')
        )
    })

    it('should be defined', () => {
        expect(eventsService).toBeDefined()
    })

    describe('create', ()=> {
        it('should create event', async () => {
            const createEvent = {
                ...mockEvent1,
                address: mockEvent1.address.toUpperCase()
            }
            jest.spyOn(eventModel, 'create').mockImplementation(() =>
                Promise.resolve({
                    ...mockEvent1
                } as any)
            )
            const newEvent = await eventsService.create(createEvent)
            expect(newEvent).toEqual(createEvent)
            expect(eventModel.create).toHaveBeenCalledWith(mockEvent1)
        })
    })
})
