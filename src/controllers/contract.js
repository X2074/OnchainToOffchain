const Web3 = require('web3').Web3
const { rpc } = require('../config')
const contractService = require('../service/contract')

class ContractCtl {
    async find(ctx) {
        const contracts = await contractService.find()
        ctx.body = { "contracts": contracts }
    }

    async findByAddress(ctx) {
        const contract = await contractService.findByAddress(ctx.params.address)
        if(!contract) { ctx.throw(404) }
        ctx.body = contract
    }

    async registerContract(ctx) {
        ctx.verifyParams({
            address: {type: 'string', require: true},
            name: {type: 'string', require: false},
            abi: {type: 'array', require: true},
            createdHash: {type: 'string', require: false},
        })
        const { address, name, abi, createdHash } = ctx.request.body
        const repeatedContract = await contractService.findByAddress(address)
        if (repeatedContract) { ctx.throw(409, `Contract:${address} already exists`); }
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
                    createdBlock: Number(transaction.blockNumber)
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

    async deleteByAddress(ctx) {
        const contract = await contractService.deleteByAddress(ctx.params.address)
        if(!contract) { ctx.throw(404) }
        ctx.status = 204
    }
}

module.exports = new ContractCtl()
