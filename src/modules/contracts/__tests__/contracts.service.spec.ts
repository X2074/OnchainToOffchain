import { Test } from '@nestjs/testing'
import { ContractsService } from '../contracts.service'
import { EventsService } from '@/modules/events/events.service'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { getModelToken, MongooseModule } from '@nestjs/mongoose'
import { Contract, ContractSchema } from '@/schema/contract.schema'
import { ConfigService } from '@nestjs/config'
import { Model } from 'mongoose'

describe('ContractsService', () => {
    let contractsService: ContractsService
    let contractModel: Model<Contract>

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [],
            providers: [
                ContractsService,
                {
                    provide: getModelToken(Contract.name, 'qng_mainnet'),
                    useValue: {
                        find: jest.fn(),
                        create: jest.fn(),
                        exec: jest.fn(),
                    },
                },
                {
                    provide: EventsService,
                    useValue: {
                        findAll: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        // 在这里模拟需要的配置项
                        get: jest.fn().mockImplementation((key: string) => {
                            if (key === 'web3.rpc') {
                                return 'https://qng.rpc.qitmeer.io';
                            }
                        }),
                    },
                },
                {
                    provide: WINSTON_MODULE_NEST_PROVIDER,
                    useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(), verbose: jest.fn() },
                },
            ],
        }).compile()
        contractsService = await moduleRef.resolve(ContractsService)
        contractModel = await moduleRef.resolve(getModelToken(Contract.name, 'qng_mainnet'))
    })

    it('should be defined', () => {
        expect(contractsService).toBeDefined();
    });
})
