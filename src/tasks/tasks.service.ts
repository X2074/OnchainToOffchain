import {Inject, Injectable, LoggerService} from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import Web3 from "web3";
import { ConfigService } from "@nestjs/config";
import { EventsService } from "@/modules/events/events.service";
import { ContractsService } from "@/modules/contracts/contracts.service";
import { Contract } from "@/schema/contract.schema";
import { FormatService } from "@/utils/format.service"

@Injectable()
export class TasksService {
    private readonly rpc: string;
    private readonly block_batches: number;
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService,
        private readonly configService: ConfigService,
        private readonly formatService: FormatService,
        private readonly contractsService: ContractsService,
        private readonly eventsService: EventsService
    ){
        this.rpc = this.configService.get<string>('web3.rpc');
        this.block_batches = Number(this.configService.get<number>('block_batches'));
    }

    /**
     * 定期获取合约事件 5分钟执行一次
     */
    @Cron('0 */5 * * * *')
    async HandleContractsEventsScanning(){
        try{
            const contracts = await this.contractsService.findAllDetail({scannable: true},'address createdBlock lastScannedBlock scannable abi')
            if(contracts.length>0){
                const httpProvider = new Web3.providers.HttpProvider(this.rpc);
                const web3 = new Web3(httpProvider);
                const currentBlockNumber = await web3.eth.getBlockNumber()
                this.logger.log(`————开始扫描合约事件 ${new Date()}————`)
                const promises = contracts.map(async (contractRecord: Contract) => {
                    //查询事件前检查合约是否需要扫描
                    if(!contractRecord.scannable || contractRecord.scanning){
                        return
                    }
                    //更新合约状态
                    await this.contractsService.update(contractRecord.address,{scanning: true})
                    try{
                        const contract = await new web3.eth.Contract(contractRecord.abi, contractRecord.address)
                        //分批次获取事件
                        var lastBlockNumber = contractRecord.lastScannedBlock
                        //增加获取数据后的校验
                        var verified = false
                        while(!verified){
                            while (lastBlockNumber < currentBlockNumber) {
                                const targetBlock = lastBlockNumber + this.block_batches < currentBlockNumber ? lastBlockNumber + this.block_batches : currentBlockNumber
                                const newEvents = await contract.getPastEvents('allEvents', {
                                    fromBlock: lastBlockNumber === 0 ? lastBlockNumber : lastBlockNumber + 1,
                                    toBlock: targetBlock
                                })
                                const events = await this.formatService.formatEvents([...newEvents])
                                const newContract = await this.contractsService.findOne(contractRecord.address)
                                //记录事件前检查合约是否需要扫描
                                if(!newContract.scannable){
                                    //更新合约状态
                                    await this.contractsService.update(contractRecord.address,{scanning: false})
                                    return
                                }
                                //记录事件
                                const eventPromises = events.map(async (event) => {
                                    try{
                                        await this.eventsService.create(event)
                                    }catch (err){
                                        this.logger.error(err)
                                    }
                                })
                                await Promise.all(eventPromises)
                                //更新合约记录
                                await this.contractsService.update(contractRecord.address,{lastScannedBlock: Number(targetBlock)})
                                lastBlockNumber += this.block_batches
                            }
                            const allEvents = await contract.getPastEvents('allEvents', {
                                fromBlock: contractRecord.createdBlock - 1,
                                toBlock: currentBlockNumber
                            })
                            const totalOnChain = allEvents.length
                            const totalOffChain = await this.eventsService.countByAddress(contractRecord.address)
                            if(totalOffChain === totalOnChain){
                                verified = true
                            }else{
                                this.logger.warn(`totalOnChain: ${totalOnChain}, totalOffChain: ${totalOffChain}, ${contractRecord.address}合约事件记录验证未通过，清除所有数据，重新扫描`)
                                //验证未通过，清除所有数据，重新扫描
                                await this.eventsService.deleteByAddress(contractRecord.address)
                                await this.contractsService.update(contractRecord.address,{lastScannedBlock: contractRecord.createdBlock - 1})
                                lastBlockNumber = contractRecord.createdBlock - 1
                            }
                        }
                    }catch (err){
                        this.logger.error(err)
                    }finally {
                        //更新合约状态
                        await this.contractsService.update(contractRecord.address,{scanning: false})
                    }
                    this.logger.log(`————${contractRecord.address}合约事件记录完成 ${new Date()}————`)
                })
                await Promise.all(promises)
                this.logger.log(`————所有合约事件记录完成 ${new Date()}————`)
            }
        }catch (err){
            this.logger.error(err)
        }
    }
}
