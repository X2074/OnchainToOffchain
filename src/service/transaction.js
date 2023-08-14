const Transaction = require('../models/transaction')

exports.addTransaction = async (transactionData) => {
    const transaction = await new Transaction(transactionData).save()
    return transaction
}
exports.addTransactions = async (transactionDatas) => {
    const transactions = transactionDatas.map(transactionData => new Transaction(transactionData))
    //批量写入
    await Transaction.bulkSave(transactions)
    return transactions
}
exports.dropIndexes = async ()=> {
    //删除现有索引
    await Transaction.collection.dropIndexes();
}
exports.createIndexes = async () => {
    //重建索引
    await Transaction.collection.createIndexes();
}
exports.findLastBlockNumber = async () => {
    const lastBlockNumber = await Transaction.findOne({}) // 查找一条记录
        .sort({blockNumber: -1}) // 按blockNumber降序排序
        .select('blockNumber') // 仅选择blockNumber字段
        .then(transaction => transaction ? transaction.blockNumber : null); // 返回blockNumber或null（如果没有找到记录）
    return lastBlockNumber
}
