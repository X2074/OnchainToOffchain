import { Test } from '@nestjs/testing'
import { ContractsController } from '../contracts.controller'
import { ContractsService } from '../contracts.service'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Contract } from '@/schema/contract.schema';
import { getModelToken } from '@nestjs/mongoose'
import { HttpException } from '@nestjs/common'


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

    describe('create', () => {
        it('should create a new contract', async () => {
            const createContractDto = { address: '0x123', abi: [], name: 'Test Contract' };
            const expectedResult = { id: '1', ...createContractDto };

            jest.spyOn(contractsService, 'findOne').mockResolvedValue(null);
            jest.spyOn(contractsService, 'create').mockResolvedValue(null);

            expect(await contractsController.create(createContractDto)).toEqual(expectedResult);
        });

        it('should throw an error if contract already exists', async () => {
            const createContractDto = { address: '0x123', abi: [], name: 'Test Contract' };

            jest.spyOn(contractsService, 'findOne').mockResolvedValue(null);

            await expect(contractsController.create(createContractDto)).rejects.toThrow(HttpException);
        });
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

    describe('findOne', () => {
        it('should return a contract by address', async () => {
            const address = '0x123';
            const expectedResult = { address, abi: [], name: 'Test Contract' };

            jest.spyOn(contractsService, 'findOne').mockResolvedValue(null);

            expect(await contractsController.findOne(address)).toEqual(expectedResult);
        });
    });

    describe('delete', () => {
        it('should delete a contract by address', async () => {
            const address = '0x123';
            const expectedResult = { address, abi: [], name: 'Deleted Contract' };

            jest.spyOn(contractsService, 'delete').mockResolvedValue(null);

            expect(await contractsController.delete(address)).toEqual(expectedResult);
        });
    });

    describe('update', () => {
        it('should update a contract', async () => {
            const address = '0x123';
            const updateContractDto = { abi: [], name: 'Updated Contract' };
            const expectedResult = { address, ...updateContractDto };

            jest.spyOn(contractsService, 'update').mockResolvedValue(null);

            expect(await contractsController.update(address, updateContractDto)).toEqual(expectedResult);
        });
    });

    describe('startScanning', () => {
        it('should start scanning a contract', async () => {
            const address = '0x123';
            const expectedResult = { address, scanning: true };

            jest.spyOn(contractsService, 'startScanning').mockResolvedValue(null);

            expect(await contractsController.startScanning(address)).toEqual(expectedResult);
        });
    });

    describe('stopScanning', () => {
        it('should stop scanning a contract', async () => {
            const address = '0x123';
            const expectedResult = { address, scanning: false };

            jest.spyOn(contractsService, 'stopScanning').mockResolvedValue(null);

            expect(await contractsController.sopScanning(address)).toEqual(expectedResult);
        });
    });

})
