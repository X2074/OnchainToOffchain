const Web3 = require('web3').Web3
const {rpc} = require('../config')
const contractService = require('../service/contract')
const eventService = require('../service/event')
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc'); // 加载 UTC 插件
dayjs.extend(utc); // 使用 UTC 插件

class ContractCtl {
    /**
     * 获取所有合约
     * @param ctx
     */
    async find(ctx) {
        const page = ctx.query.page ? ctx.query.page : 1
        const pageSize = ctx.query.pageSize ? ctx.query.pageSize : 10
        const result = await contractService.find(page, pageSize)
        ctx.body = result
    }

    /**
     * 获取指定地址的合约
     * @param ctx
     */
    async findByAddress(ctx) {
        const contract = await contractService.findByAddress(ctx.params.address)
        if (!contract) {
            ctx.throw(404, 'No eligible contracts exist')
        }
        ctx.body = contract
    }

    /**
     * 登记需要扫描数据的合约
     * @param ctx
     */
    async registerContract(ctx) {
        ctx.verifyParams({
            address: {type: 'string', require: true},
            name: {type: 'string', require: false},
            abi: {type: 'array', require: true},
            createdHash: {type: 'string', require: false},
        })
        const {address, name, abi, createdHash} = ctx.request.body
        const repeatedContract = await contractService.findByAddress(address)
        if (repeatedContract) {
            ctx.throw(409, `Contract:${address} already exists`);
        }
        // 如果请求中包含了createdHash，进行校验
        if (createdHash) {
            const httpProvider = new Web3.providers.HttpProvider(rpc);
            const web3 = new Web3(httpProvider);
            // 获取合约创建交易的信息
            const transaction = await web3.eth.getTransactionReceipt(createdHash);
            if (transaction && transaction.contractAddress && transaction.contractAddress.toLowerCase() === address.toLowerCase()) {
                // 校验通过时，记录创建人和时间
                const createdBy = transaction.from.toLowerCase();
                const block = await web3.eth.getBlock(transaction.blockNumber)
                const createdTime = new Date(Number(block.timestamp) * 1000) // 将Unix时间戳转换为Date对象
                // 将校验通过的数据添加到合约信息中
                const contractData = {
                    address: address.toLowerCase(),
                    name,
                    abi,
                    createdHash,
                    createdBy,
                    createdTime,
                    createdBlock: Number(transaction.blockNumber),
                    lastScannedBlock: Number(transaction.blockNumber)-1
                };
                // 保存合约信息到数据库
                const contract = await contractService.addContract(contractData)
                ctx.body = contract;
            } else {
                // 校验失败时，返回错误信息
                ctx.throw(400, 'Invalid createdHash. It does not match the contract address.');
            }
        } else {
            // 如果没有createdHash，继续原来的逻辑
            const contract = await contractService.addContract({
                address: address.toLowerCase(),
                name,
                abi
            })
            ctx.body = contract;
        }
    }

    /**
     * 删除合约
     * @param ctx
     */
    async deleteByAddress(ctx) {
        const contract = await contractService.deleteByAddress(ctx.params.address)
        if (!contract) {
            ctx.throw(404, 'No eligible contracts exist')
        }
        ctx.status = 204
    }

    /**
     * 启动合约事件的记录
     * @param ctx
     */
    async startScanning(ctx) {
        const contract = await contractService.startScanning(ctx.params.address)
        if (!contract) {
            ctx.throw(404, 'No eligible contracts exist')
        }
        ctx.body = contract
    }

    /**
     * 暂停合约事件的记录
     * @param ctx
     * @return {Promise<void>}
     */
    async stopScanning(ctx) {
        const contract = await contractService.stopScanning(ctx.params.address)
        if (!contract) {
            ctx.throw(404, 'No eligible contracts exist')
        }
        ctx.body = contract
    }

    /**
     * 清空指定合约的事件记录
     * @param ctx
     * @return {Promise<void>}
     */
    async clearEvents(ctx) {
        const contract = await contractService.clearEvents(ctx.params.address)
        if (!contract) {
            ctx.throw(404, 'No eligible contracts exist')
        }
        ctx.body = contract
    }

    /**
     * 获取合约的所有事件记录
     * @param ctx
     */
    async getAllEvents(ctx) {
        const page = ctx.query.page ? ctx.query.page : 1
        const pageSize = ctx.query.pageSize ? ctx.query.pageSize : 10
        const result = await eventService.findByAddress(ctx.params.address, page, pageSize)
        ctx.body = result
    }

    /**
     * 根据条件进行自定义检索
     * @param ctx
     */
    async getEvents(ctx) {
        ctx.verifyParams({
            queryCriteria: {type: 'object', require: true}
        })
        const queryCriteria = ctx.request.body.queryCriteria
        queryCriteria.address = queryCriteria.address.toLowerCase()
        if (!queryCriteria || !queryCriteria.address) {
            ctx.throw(400, 'The query criteria must include contract address information. Such as: { address: \'Your_Contract_Address\' }')
        }
        if (!queryCriteria.time) {// 原有的查询条件对time没有约束时，加入时间范围条件
            const endTime = ctx.request.body.endTime ? dayjs.utc(ctx.request.body.endTime).toDate() : dayjs.utc().toDate() //没有提供结束时间时默认使用当前时间
            const startTime = ctx.request.body.startTime ? dayjs.utc(ctx.request.body.startTime).toDate() : dayjs.utc(endTime).subtract(6, 'day').startOf('day').toDate() //没有提供结束时间时默认使用结束时间前7天的0点时间（也就是默认查询七天的数据）
            queryCriteria.time = {$gte: startTime, $lte: endTime}
        }
        const selectField = ctx.request.body.selectField ? ctx.request.body.selectField : ''
        const sortCriteria = ctx.request.body.sortCriteria ? ctx.request.body.sortCriteria : {time: -1}
        const page = ctx.request.body.page ? ctx.request.body.page : 1
        const pageSize = ctx.request.body.pageSize ? ctx.request.body.pageSize : 10
        const result = await eventService.find(queryCriteria, selectField, sortCriteria, page, pageSize)
        ctx.body = result
    }
    /**
     * 根据条件统计事件数据
     * @param ctx
     */
    async getEventsStatistics(ctx){
        ctx.verifyParams({
            queryCriteria: {type: 'object', require: true},
            options: {type: 'object', require: true}
        })
        const queryCriteria = ctx.request.body.queryCriteria
        queryCriteria.address = queryCriteria.address.toLowerCase()
        if (!queryCriteria || !queryCriteria.address) {
            ctx.throw(400, 'The query criteria must include contract address information. Such as: { address: \'Your_Contract_Address\' }')
        }
        const endTime = ctx.request.body.endTime ? dayjs.utc(ctx.request.body.endTime).toDate() : dayjs.utc().toDate() //没有提供结束时间时默认使用当前时间
        const startTime = ctx.request.body.startTime ? dayjs.utc(ctx.request.body.startTime).toDate() : dayjs.utc(endTime).subtract(6, 'day').startOf('day').toDate() //没有提供结束时间时默认使用结束时间前7天的0点时间（也就是默认查询七天的数据）
        queryCriteria.time = {$gte: startTime, $lte: endTime}
        const unit = ctx.request.body.unit ? ctx.request.body.unit.toLowerCase() : 'day'; // "day" 或 "hour" 或 "all"
        if(["day","hour","all"].indexOf(unit)<0){
            ctx.throw(400, 'Unit can only be \'day\', \'hour\', or \'all\'')
        }
        const options = ctx.request.body.options; // 统计操作的描述（count/sum/average/min/max） 例如: { "returnValues.creator":"count","returnValues.metadata.royaltyFraction":"sum"}
        const result = await eventService.getEventsStatistics(queryCriteria, unit, startTime, endTime, options)
        ctx.body = result
    }

}

module.exports = new ContractCtl()
