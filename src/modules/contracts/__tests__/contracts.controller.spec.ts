import { Test } from '@nestjs/testing'
import { ContractsController } from '../contracts.controller'
import { ContractsService } from '../contracts.service'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { HttpException } from '@nestjs/common'
import { mockContract1, mockContracts } from '@/mocks/contract.mock'
import { ContractSummaryDto, CreateContractDto } from '../contract.dto'

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
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findAllDetail: jest.fn(),
                        findOne: jest.fn(),
                        findOneDetail: jest.fn(),
                        delete: jest.fn(),
                        update: jest.fn(),
                        startScanning: jest.fn(),
                        stopScanning: jest.fn(),
                        clearEvents: jest.fn(),
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
        contractsService = await moduleRef.resolve(ContractsService)
        contractsController = await moduleRef.resolve(ContractsController)
    })

    it('should be defined', () => {
        expect(contractsController).toBeDefined()
    })

    it('should be defined', () => {
        expect(contractsService).toBeDefined()
    })

    describe('create', () => {
        const createContractDto: CreateContractDto = {
            address: mockContract1.address,
            name: mockContract1.name,
            abi: mockContract1.abi,
            createdHash: mockContract1.createdHash,
        }
        it('should create a new contract', async () => {
            jest.spyOn(contractsService, 'findOne').mockResolvedValue(null)
            jest.spyOn(contractsService, 'create').mockResolvedValue(
                mockContract1
            )

            expect(await contractsController.create(createContractDto)).toEqual(
                mockContract1
            )
        })

        it('should throw an error if contract already exists', async () => {
            jest.spyOn(contractsService, 'findOne').mockResolvedValue(
                mockContract1
            )

            await expect(
                contractsController.create(createContractDto)
            ).rejects.toThrow(HttpException)
        })
    })

    describe('findAll', () => {
        it('should return an object containing contract array and paging information', async () => {
            const result: {
                total: number
                contracts: ContractSummaryDto[]
                page: number
                pageSize: number
            } = {
                total: 2,
                contracts: mockContracts.map(({ abi, ...rest }) => rest),
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
            const address = mockContract1.address
            const { abi, ...mockContractWithoutAbi } = mockContract1

            jest.spyOn(contractsService, 'findOne').mockResolvedValue(
                mockContractWithoutAbi
            )

            expect(await contractsController.findOne(address)).toEqual(
                mockContractWithoutAbi
            )
        })
    })

    describe('findOneDetail', () => {
        it('should return a contract detail (containing abi) by address', async () => {
            const address = mockContract1.address

            jest.spyOn(contractsService, 'findOne').mockResolvedValue(
                mockContract1
            )

            expect(await contractsController.findOne(address)).toEqual(
                mockContract1
            )
        })
    })

    describe('delete', () => {
        it('should delete a contract by address', async () => {
            const address = mockContract1.address

            jest.spyOn(contractsService, 'findOne').mockResolvedValue(
                mockContract1
            )
            jest.spyOn(contractsService, 'delete').mockResolvedValue(
                mockContract1
            )

            expect(await contractsController.delete(address)).toEqual(
                mockContract1
            )
        })
    })

    describe('update', () => {
        it('should update a contract', async () => {
            const address = mockContract1.address
            const updateContractDto = { name: 'Updated Contract' }
            const expectedResult = {
                ...mockContract1,
                name: 'Updated Contract',
            }

            jest.spyOn(contractsService, 'findOne').mockResolvedValue(
                mockContract1
            )
            jest.spyOn(contractsService, 'update').mockResolvedValue(
                expectedResult
            )

            expect(
                await contractsController.update(address, updateContractDto)
            ).toEqual(expectedResult)
        })
    })

    describe('startScanning', () => {
        it('should start scanning a contract', async () => {
            const address = mockContract1.address
            const { abi, ...mockContractWithoutAbi } = mockContract1
            const expectedFindResult = {
                ...mockContractWithoutAbi,
                scannable: false,
            }
            const expectedResult = {
                ...mockContractWithoutAbi,
                scannable: true,
            }

            jest.spyOn(contractsService, 'findOne').mockResolvedValue(
                expectedFindResult
            )
            jest.spyOn(contractsService, 'startScanning').mockResolvedValue(
                expectedResult
            )

            expect(await contractsController.startScanning(address)).toEqual(
                expectedResult
            )
        })

        it('should return 204 No Content if contract is started', async () => {
            const address = mockContract1.address
            const { abi, ...mockContractWithoutAbi } = mockContract1
            const expectedFindResult = {
                ...mockContractWithoutAbi,
                scannable: true,
            }
            jest.spyOn(contractsService, 'findOne').mockResolvedValue(
                expectedFindResult
            )

            await expect(
                contractsController.startScanning(address)
            ).rejects.toThrow(HttpException)
        })
    })

    describe('stopScanning', () => {
        it('should stop scanning a contract', async () => {
            const address = mockContract1.address
            const { abi, ...mockContractWithoutAbi } = mockContract1
            const expectedFindResult = {
                ...mockContractWithoutAbi,
                scannable: true,
            }
            const expectedResult = {
                ...mockContractWithoutAbi,
                scannable: false,
            }

            jest.spyOn(contractsService, 'findOne').mockResolvedValue(
                expectedFindResult
            )
            jest.spyOn(contractsService, 'stopScanning').mockResolvedValue(
                expectedResult
            )

            expect(await contractsController.stopScanning(address)).toEqual(
                expectedResult
            )
        })

        it('should return 204 No Content if contract is stopped', async () => {
            const address = mockContract1.address
            const { abi, ...mockContractWithoutAbi } = mockContract1
            const expectedFindResult = {
                ...mockContractWithoutAbi,
                scannable: false,
            }
            jest.spyOn(contractsService, 'findOne').mockResolvedValue(
                expectedFindResult
            )

            await expect(
                contractsController.stopScanning(address)
            ).rejects.toThrow(HttpException)
        })
    })

    describe('clearEvents', () => {
        it('should clear events of a contract with address', async () => {
            const address = mockContract1.address
            const { abi, ...mockContractWithoutAbi } = mockContract1

            jest.spyOn(contractsService, 'clearEvents').mockResolvedValue(
                mockContractWithoutAbi
            )

            expect(await contractsController.clearEvents(address)).toEqual(
                mockContractWithoutAbi
            )
        })
    })
})
