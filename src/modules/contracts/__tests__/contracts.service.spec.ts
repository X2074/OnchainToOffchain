import { Test } from '@nestjs/testing'
import { ContractsService } from '../contracts.service'
import { EventsService } from '@/modules/events/events.service'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { getModelToken } from '@nestjs/mongoose'
import { Contract } from '@/schema/contract.schema'
import { ConfigService } from '@nestjs/config'
import { Model } from 'mongoose'
import { mockContract1, mockContract2, mockContracts } from '@/mocks/contract.mock'
import { ContractSummaryDto, CreateContractDto } from '@/modules/contracts/contract.dto'
import { HttpException } from '@nestjs/common'

describe('ContractsService', () => {
    let contractsService: ContractsService
    let eventsService: EventsService
    let contractModel: Model<Contract>

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [],
            providers: [
                ContractsService,
                {
                    provide: getModelToken(Contract.name, 'qng_mainnet'),
                    useValue: {
                        new: jest.fn().mockResolvedValue(mockContract1),
                        constructor: jest.fn().mockResolvedValue(mockContract1),
                        create: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        findOneAndDelete: jest.fn(),
                        findOneAndUpdate: jest.fn(),
                        select: jest.fn(),
                        exec: jest.fn(),
                        countDocuments: jest.fn()
                    },
                },
                {
                    provide: EventsService,
                    useValue: {
                        findAll: jest.fn(),
                        deleteByAddress: jest.fn()
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
        contractsService = moduleRef.get<ContractsService>(ContractsService)
        eventsService = moduleRef.get<EventsService>(EventsService)
        contractModel = moduleRef.get<Model<Contract>>(getModelToken(Contract.name, 'qng_mainnet'))
    })

    it('should be defined', () => {
        expect(contractsService).toBeDefined()
    })

    describe('create', () => {
        it('should create contract', async () => {
            const createContractDto : CreateContractDto = {
                address: mockContract1.address,
                name: mockContract1.name,
                abi: mockContract1.abi,
                createdHash: mockContract1.createdHash,
            }
            const { scannable, scanning, ...savedContract } = mockContract1
            jest.spyOn(contractModel, 'create').mockImplementation(()=>Promise.resolve({
                ...mockContract1
            } as any));
            const newContract = await contractsService.create(createContractDto)
            expect(newContract).toEqual(mockContract1)
            expect(contractModel.create).toHaveBeenCalledWith(savedContract);
        });

        it('should throw an error if createdHash does not match the contract address', async () => {
            const createContractDto : CreateContractDto = {
                address: mockContract1.address,
                name: mockContract1.name,
                abi: mockContract1.abi,
                createdHash: mockContract2.createdHash,
            }

            await expect(contractsService.create(createContractDto)).rejects.toThrow(
                HttpException
            );
        })
    });

    describe('findAll', () => {
        it('should return an object containing contract array and paging information', async () => {
            const contracts = mockContracts.map(({ abi, ...rest }) => rest)
            const total = contracts.length;
            contractModel.countDocuments = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(total),
            });
            contractModel.find = jest.fn().mockReturnValue({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(contracts),
            });

            await expect(contractsService.findAll(1, 10)).resolves.toEqual({
                total: total,
                contracts: contracts,
                page: 1,
                pageSize: 10,
            });
        })
    })

    describe('findAllDetail', () => {
        it('should return an array of contracts', async () => {
            const queryCriteria = { scannable: true, scanning: false }
            const selectField = 'address createdBlock lastScannedBlock scannable scanning abi'
            const filteredContracts = mockContracts.filter(contract =>
                contract.scannable === queryCriteria.scannable && contract.scanning === queryCriteria.scanning
            );
            const selectedFields = selectField.split(' ');
            const finalContracts = filteredContracts.map(contract => {
                const selectedContract = {};
                selectedFields.forEach(field => {
                    selectedContract[field] = contract[field];
                });
                return selectedContract;
            });
            contractModel.find = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(finalContracts),
            });

            await expect(contractsService.findAllDetail(queryCriteria, selectField))
                .resolves.toEqual(finalContracts);

            expect(contractModel.find).toHaveBeenCalledWith(queryCriteria);
            expect(contractModel.find().select).toHaveBeenCalledWith(selectField);
        })
    })

    describe('findOne', () => {
        it('should return a contract by address', async () => {
            const address = mockContract1.address
            const { abi, ...mockContractWithoutAbi } = mockContract1

            contractModel.findOne = jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockContractWithoutAbi),
            });

            expect(await contractsService.findOne(address)).toEqual(
                mockContractWithoutAbi,
            )
            expect(contractModel.findOne).toHaveBeenCalledWith({ address: address.toLowerCase() });
        })
    })

    describe('findOneDetail', () => {
        it('should return a contract detail (containing abi) by address', async () => {
            const address = mockContract1.address

            contractModel.findOne = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockContract1),
            });

            expect(await contractsService.findOneDetail(address)).toEqual(
                mockContract1
            )
            expect(contractModel.findOne).toHaveBeenCalledWith({ address: address.toLowerCase() });
            expect(contractModel.findOne().select).toHaveBeenCalledWith('+abi');
        })
    })

    describe('delete', () => {
        it('should delete a contract by address', async () => {
            const address = mockContract1.address
            const { abi, ...mockContractWithoutAbi } = mockContract1

            jest.spyOn(contractsService, 'findOne').mockResolvedValue(mockContractWithoutAbi)

            contractModel.findOneAndDelete = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockContract1),
            });

            expect(await contractsService.delete(address)).toEqual(
                mockContract1,
            )
            expect(contractModel.findOneAndDelete).toHaveBeenCalledWith({ address: address.toLowerCase() });
            expect(contractModel.findOneAndDelete().select).toHaveBeenCalledWith('+abi');
        })

        it("should throw an error if contract doesn't exist", async () => {
            const address = mockContract1.address

            jest.spyOn(contractsService, 'findOne').mockResolvedValue(null)

            await expect(contractsService.delete(address)).rejects.toThrow(
                HttpException
            )
        })
    })

    describe('update', () => {
        it('should update a contract by address', async () => {
            const address = mockContract1.address
            const { abi, ...mockContractWithoutAbi } = mockContract1
            const updateContractDto = { name: 'Updated Contract' }
            const expectedResult = {
                ...mockContract1,
                name: 'Updated Contract',
            }

            jest.spyOn(contractsService, 'findOne').mockResolvedValue(mockContractWithoutAbi)

            contractModel.findOneAndUpdate = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(expectedResult),
            });

            expect(await contractsService.update(address, updateContractDto)).toEqual(
                expectedResult,
            )
            expect(contractModel.findOneAndUpdate).toHaveBeenCalledWith({ address: address.toLowerCase() },
                updateContractDto,
                { new: true });
            expect(contractModel.findOneAndUpdate().select).toHaveBeenCalledWith('+abi');
        })

        it("should throw an error if contract doesn't exist", async () => {
            const address = mockContract1.address
            const updateContractDto = { name: 'Updated Contract' }

            jest.spyOn(contractsService, 'findOne').mockResolvedValue(null)

            await expect(contractsService.update(address, updateContractDto)).rejects.toThrow(
                HttpException
            )
        })
    })

    describe('startScanning', () => {
        it('should start scanning a contract', async () => {
            const address = mockContract1.address
            const expectedResult = {
                ...mockContract1,
                scannable: true,
            }

            jest.spyOn(contractsService, 'update').mockResolvedValue(expectedResult)

            expect(await contractsService.startScanning(address)).toEqual(
                expectedResult
            )
        })
    })

    describe('stopScanning', () => {
        it('should stop scanning a contract', async () => {
            const address = mockContract1.address
            const expectedResult = {
                ...mockContract1,
                scannable: false,
            }

            jest.spyOn(contractsService, 'update').mockResolvedValue(expectedResult)

            expect(await contractsService.stopScanning(address)).toEqual(
                expectedResult
            )
        })
    })

    describe('clearEvents', () => {
        it('should stop scanning a contract', async () => {
            const address = mockContract1.address
            const { abi, ...mockContractWithoutAbi } = mockContract1
            const expectedResult = {
                ...mockContract1,
                lastScannedBlock: mockContract1.createdBlock ? mockContract1.createdBlock : 0
            }
            jest.spyOn(contractsService, 'findOne').mockResolvedValue(mockContractWithoutAbi)


            jest.spyOn(contractsService, 'stopScanning').mockResolvedValue({...expectedResult, scannable: false})

            //Todo: fixed this after finishing eventService
            jest.spyOn(eventsService, 'deleteByAddress').mockResolvedValue(null)

            jest.spyOn(contractsService, 'update').mockResolvedValue(expectedResult)

            expect(await contractsService.clearEvents(address)).toEqual(
                expectedResult
            )
        })
    })
})
