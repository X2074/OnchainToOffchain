const Web3 = require('web3').Web3
const { rpc } = require('../config')
/**
 * 查询事件时间戳，格式化events
 */
exports.formatEvents = async (events) => {
    const httpProvider = new Web3.providers.HttpProvider(rpc);
    const web3 = new Web3(httpProvider);
    const promises = events.map(event =>
        Promise.all([
            web3.eth.getBlock(event.blockNumber),
            web3.eth.getTransaction(event.transactionHash)
        ]).then(([block, transaction]) => {
            const newEvent = event
            newEvent.time =  new Date(Number(timestamp) * 1000) // 将Unix时间戳转换为Date对象
            newEvent.blockNumber = Number(event.blockNumber)
            newEvent.transactionIndex = Number(event.transactionIndex)
            newEvent.logIndex = Number(event.logIndex)
            newEvent.fromAddress = transaction.from
            Object.keys(newEvent.returnValues).forEach(key => {
                if(typeof(newEvent.returnValues[key])==='object'){
                    Object.keys(newEvent.returnValues[key]).forEach(key2 => {
                        newEvent.returnValues[key][key2] = newEvent.returnValues[key][key2].toString()
                    })
                }else{
                    newEvent.returnValues[key] = newEvent.returnValues[key].toString();
                }
            });
            return newEvent
        })
    );
    return await Promise.all(promises)
}
/**
 * 查询区块时间戳，格式化Transactions
 */
exports.formatTransactions= (block) => {
    if(block.transactions){
        return block.transactions.map(transaction=>{
            return {
                hash: transaction.hash,
                blockHash: transaction.blockHash,
                blockNumber: Number(transaction.blockNumber),
                time: new Date(Number(block.timestamp) * 1000), // 将Unix时间戳转换为Date对象
                from: transaction.from,
                gas: transaction.gas.toString(),
                gasPrice: transaction.gasPrice.toString(),
                input: transaction.input,
                nonce: transaction.nonce.toString(),
                to: transaction.to,
                transactionIndex: Number(transaction.transactionIndex),
                value: transaction.value.toString(),
                type: transaction.type.toString(),
                chainId: Number(transaction.chainId),
                v: transaction.v.toString(),
                r: transaction.r.toString(),
                s: transaction.s.toString()
            }
        })
    }else {
        return []
    }
}
/**
 * 格式化Block
 */
exports.formatBlock= (block) => {
        return {
            hash: block.hash,
            number: Number(block.number),
            time: new Date(Number(block.timestamp) * 1000), // 将Unix时间戳转换为Date对象
            timestamp: Number(block.timestamp),
            difficulty: block.difficulty,
            extraData: block.extraData,
            gasLimit: block.gasLimit.toString(),
            gasUsed: block.gasUsed.toString(),
            logsBloom: block.logsBloom,
            miner: block.miner,
            mixHash: block.mixHash,
            nonce: block.nonce.toString(),
            parentHash: block.parentHash,
            sha3Uncles: block.sha3Uncles,
            size: Number(block.size),
            stateRoot: block.stateRoot,
            totalDifficulty: block.totalDifficulty,
            transactionsRoot: block.transactionsRoot,
            uncles: block.uncles
        }
}
