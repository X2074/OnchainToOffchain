const contractService = require('../service/contract')
const eventService = require('../service/event')
const Web3 = require('web3').Web3
const { rpc, batches } = require('../config')
const { formatEvents } = require('../utils/format')
const {logger} = require("./log4");
/**
 * 定期获取合约事件 5分钟执行一次
 */
exports.scanContracts = async () => {
    try{
        const contracts = await contractService.findAllDetail({scannable: true},'address createdBlock lastScannedBlock scannable abi')
        if(contracts.length>0){
            const httpProvider = new Web3.providers.HttpProvider(rpc);
            const web3 = new Web3(httpProvider);
            const currentBlockNumber = await web3.eth.getBlockNumber()
            logger.info(`————开始扫描合约事件 ${new Date()}————`)
            const promises = contracts.map(async (contractRecord) => {
                //查询事件前检查合约是否需要扫描
                if(!contractRecord.scannable || contractRecord.scanning){
                    return
                }
                //更新合约状态
                await contractService.update(contractRecord.address,{scanning: true})
                try{
                    const contract = await new web3.eth.Contract(contractRecord.abi, contractRecord.address)
                    //分批次获取事件
                    var lastBlockNumber = contractRecord.lastScannedBlock
                    //增加获取数据后的校验
                    var verified = false
                    while(!verifide){
                        while (lastBlockNumber < currentBlockNumber) {
                            const targetBlock = lastBlockNumber + batches < currentBlockNumber ? lastBlockNumber + batches : currentBlockNumber
                            const newEvents = await contract.getPastEvents('allEvents', {
                                fromBlock: lastBlockNumber === 0 ? lastBlockNumber : lastBlockNumber + 1,
                                toBlock: targetBlock
                            })
                            const events = await formatEvents([...newEvents])
                            const newContract = await contractService.findByAddress(contractRecord.address)
                            //记录事件前检查合约是否需要扫描
                            if(!newContract.scannable){
                                //更新合约状态
                                await contractService.update(contractRecord.address,{scanning: false})
                                return
                            }
                            //记录事件
                            const eventPromises = events.map(async (event) => {
                                try{
                                    await eventService.addEvent(event)
                                }catch (err){
                                    logger.error(err)
                                }
                            })
                            await Promise.all(eventPromises)
                            //更新合约记录
                            await contractService.update(contractRecord.address,{lastScannedBlock: Number(targetBlock)})
                            lastBlockNumber += batches
                        }
                        const totalOnChain = await contract.getPastEvents('allEvents', {
                            fromBlock: contractRecord.createdBlock - 1,
                            toBlock: currentBlockNumber
                        })
                        const totalOffChain = await eventService.countByAddress(contractRecord.address)
                        if(totalOffChain === totalOnChain){
                            verified = true
                        }else{
                            logger.warn(`totalOnChain: ${totalOnChain}, totalOffChain: ${totalOffChain}, ${contractRecord.name}合约事件记录验证未通过，清除所有数据，重新扫描`)
                            //验证未通过，清除所有数据，重新扫描
                            await eventService.deleteEventsByAddress(contractRecord.address)
                            await contractService.update(contractRecord.address,{lastScannedBlock: contractRecord.createdBlock - 1})
                            lastBlockNumber = contractRecord.createdBlock - 1
                        }
                    }
                }catch (err){
                    logger.error(err)
                }finally {
                    //更新合约状态
                    await contractService.update(contractRecord.address,{scanning: false})
                }
                logger.info(`————${contractRecord.name}合约事件记录完成 ${new Date()}————`)
            })
            await Promise.all(promises)
            logger.info(`————所有合约事件记录完成 ${new Date()}————`)
        }
    }catch (err){
        logger.error(err)
    }
}
