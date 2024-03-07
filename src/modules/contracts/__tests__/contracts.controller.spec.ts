import { Test } from '@nestjs/testing'
import { ContractsController } from '../contracts.controller'
import { ContractsService } from '../contracts.service'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Contract } from '@/schema/contract.schema';
import { getModelToken } from '@nestjs/mongoose'


describe('ContractsController', () => {
    let contractsController: ContractsController
    let contractsService: ContractsService

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [ContractsController],
            providers: [
                {
                    provide: ContractsService,
                    useValue: {
                        findAll: jest.fn(),
                    },
                },
                {
                    provide: WINSTON_MODULE_NEST_PROVIDER,
                    useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(), verbose: jest.fn() },
                },
            ],
        }).compile()
        contractsService = await moduleRef.resolve(ContractsService)
        contractsController = await moduleRef.resolve(ContractsController)
    })

    it('should be defined', () => {
        expect(contractsController).toBeDefined();
    });
    it('should be defined', () => {
        expect(contractsService).toBeDefined();
    });
    describe('findAll', () => {
        it('should return an object containing contract array and paging information', async () => {
            const result: {
                total: number
                contracts: Contract[]
                page: number
                pageSize: number
            } = {
                total: 1,
                contracts: [],
                page: 1,
                pageSize: 10,
            }

            jest.spyOn(contractsService, 'findAll').mockImplementation(
                async () => result
            )

            expect(await contractsController.findAll('1', '10')).toEqual(result)
        })
    })
})
