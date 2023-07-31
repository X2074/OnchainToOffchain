const Web3 = require('web3').Web3
const { rpc } = require('../config')
/**
 * 查询事件时间戳，格式化events
 * @param events
 */
exports.formatEvents = async (events) => {
    const httpProvider = new Web3.providers.HttpProvider(rpc);
    const web3 = new Web3(httpProvider);
    const promises = []
    for (let i = 0; i < events.length; i++) {
        const event = events[i]
        const promise = web3.eth.getBlock(event.blockNumber).then((block) => {
            const timestamp = block.timestamp
            const newEvent = event
            newEvent.time =  new Date(Number(timestamp) * 1000) // 将Unix时间戳转换为Date对象
            newEvent.blockNumber = Number(event.blockNumber)
            newEvent.transactionIndex = Number(event.transactionIndex)
            newEvent.logIndex = Number(event.logIndex)
            Object.keys(newEvent.returnValues).forEach(key => {
                newEvent.returnValues[key] = newEvent.returnValues[key].toString();
            });
            return newEvent
        })
        promises.push(promise)
    }
    return await Promise.all(promises)
}
