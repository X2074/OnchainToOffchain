const contractService = require('../service/contract')
const eventService = require('../service/event')
const Web3 = require('web3').Web3
const { rpc, batches } = require('../config')
const { formatEvents } = require('../utils/format')
/**
 * 定期获取合约事件 5分钟执行一次
 */
exports.scanContracts = async () => {
    const contracts = await contractService.find({scannable: true},'address createdBlock lastScannedBlock scannable abi')
    if(contracts.length>0){
        const httpProvider = new Web3.providers.HttpProvider(rpc);
        const web3 = new Web3(httpProvider);
        const currentBlockNumber = await web3.eth.getBlockNumber()
        console.log(`————开始扫描合约事件 ${new Date()}————`)
        const promises = contracts.map(async (contractRecord) => {
            //查询事件前检查合约是否需要扫描
            if(!contractRecord.scannable){
                return
            }
            const contract = await new web3.eth.Contract(contractRecord.abi, contractRecord.address)
            //分批次获取事件
            var lastBlockNumber = contractRecord.createdBlock ? contractRecord.createdBlock : contractRecord.lastScannedBlock
            while (lastBlockNumber < currentBlockNumber) {
                const targetBlock = lastBlockNumber + batches < currentBlockNumber ? lastBlockNumber + batches : currentBlockNumber
                const newEvents = await contract.getPastEvents('allEvents', {
                    fromBlock: lastBlockNumber === 0 ? lastBlockNumber : lastBlockNumber + 1,
                    toBlock: targetBlock
                })
                const events = await formatEvents([...newEvents])
                console.log(events)
                const newContract = await contractService.findByAddress(contractRecord.address)
                //记录事件前检查合约是否需要扫描
                if(!newContract.scannable){
                    return
                }
                //记录事件
                const eventPromises = events.map(async (event) => {
                    await eventService.addEvent(event)
                })
                await Promise.all(eventPromises)
                //更新合约记录
                await contractService.update(contractRecord.address,{lastScannedBlock: targetBlock})
                lastBlockNumber += batches
            }
        })
        await Promise.all(promises)
        console.log(`————合约事件记录完成 ${new Date()}————`)
    }
}
