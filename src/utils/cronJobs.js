const contractService = require('../service/contract')
const eventService = require('../service/event')
const transactionService = require('../service/transaction')
const blockService = require('../service/block')
const Web3 = require('web3').Web3
const { rpc, batches } = require('../config')
const { formatEvents, formatTransactions, formatBlock } = require('../utils/format')
const {logger} = require("./log4");
const cache = require("./cache")
const {addBlocks} = require("../service/block");
/**
 * 定期获取合约事件
 */
exports.scanContractsEvents = async () => {
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
                    while(!verified){
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
                        const allEvents = await contract.getPastEvents('allEvents', {
                            fromBlock: contractRecord.createdBlock - 1,
                            toBlock: currentBlockNumber
                        })
                        const totalOnChain = allEvents.length
                        const totalOffChain = await eventService.countByAddress(contractRecord.address)
                        if(totalOffChain === totalOnChain){
                            verified = true
                        }else{
                            logger.warn(`totalOnChain: ${totalOnChain}, totalOffChain: ${totalOffChain}, ${contractRecord.address}合约事件记录验证未通过，清除所有数据，重新扫描`)
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
                logger.info(`————${contractRecord.address}合约事件记录完成 ${new Date()}————`)
            })
            await Promise.all(promises)
            logger.info(`————所有合约事件记录完成 ${new Date()}————`)
        }
    }catch (err){
        logger.error(err)
    }
}
/**
 * 定期获取区块中的交易记录
 */
exports.scanTransactions = async () => {
    try{
        let lastScannedBlockNumber = cache.get('lastScannedBlockNumber');
        if(lastScannedBlockNumber===undefined){
            lastScannedBlockNumber= await transactionService.findLastBlockNumber()
            cache.set('lastScannedBlockNumber',lastScannedBlockNumber)
        }
        let blockScanning = cache.get('blockScanning');
        if(blockScanning===undefined) {
            blockScanning = false
            cache.set('blockScanning', blockScanning)
        }
        if(blockScanning===false){
            blockScanning=true
            cache.set('blockScanning',blockScanning)
            let transactions = [];
            let blocks = [];
            const httpProvider = new Web3.providers.HttpProvider(rpc);
            const web3 = new Web3(httpProvider);
            // const currentBlockNumber = Number(await web3.eth.getBlockNumber())
            const currentBlockNumber = 1000
            if(currentBlockNumber>lastScannedBlockNumber){
                logger.info(`————开始扫描区块交易 ${new Date()}————`)
                await blockService.dropIndexes()
                await transactionService.dropIndexes()
                try{
                    for (let i = lastScannedBlockNumber===null? 0 : lastScannedBlockNumber+1; i <= currentBlockNumber; i++) {
                        const block = await web3.eth.getBlock(i, true);
                        blocks.push(formatBlock(block))
                        for (const transaction of formatTransactions(block)) {
                            transactions.push(transaction)
                        }
                        if(transactions.length>10){
                            await blockService.addBlocks(blocks)
                            await transactionService.addTransactions(transactions)
                            blocks = []
                            transactions = []
                            cache.set('lastScannedBlockNumber',i)
                            logger.info(`****完成区块${i}数据录入 ${new Date()}****`)
                        }
                    }
                    if(transactions.length>0){
                        await blockService.addBlocks(blocks)
                        await transactionService.addTransactions(transactions)
                        cache.set('lastScannedBlockNumber',currentBlockNumber)
                    }
                }catch (err){
                    logger.error(err)
                }
                await blockService.createIndexes()
                await transactionService.createIndexes()
                logger.info(`————完成区块交易扫描，最新区块：${currentBlockNumber} ${new Date()}————`)
            }
            blockScanning=false
            cache.set('blockScanning',blockScanning)
        }

    }catch (err){
        logger.error(err)
    }
}
