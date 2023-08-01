const Contract = require('../models/contract')
const eventService = require('./event')

exports.find = async (page, pageSize) => {
    const total = await Contract.countDocuments()
    const contracts = await Contract
        .find()
        .skip((page - 1) * pageSize) // 跳过前面的页数
        .limit(pageSize) // 指定每页的大小
        .exec(); // 执行查询;
    return {total: total, contracts: contracts, page: page, pageSize: pageSize}
}

exports.findAllDetail = async (queryCriteria, selectField) => {
    const contracts = await Contract.find(queryCriteria).select(selectField).exec();
    return contracts
}

exports.findByAddress = async (address) => {
    const contract = await Contract.findOne({address: address.toLowerCase()});
    return contract
}

exports.findDetailByAddress = async (address) => {
    const contract = await Contract.findOne({address: address.toLowerCase()}).select('+abi');
    return contract
}

exports.deleteByAddress = async (address) => {
    const contract = await Contract.findOneAndRemove({address: address.toLowerCase()})
    await eventService.deleteEventsByAddress(address)
    return contract
}

exports.addContract = async (contractData) => {
    const contract = await new Contract(contractData).save()
    return contract
}

exports.update = async (address, contractData) => {
    const contract = await Contract.findOneAndUpdate({address: address.toLowerCase()}, contractData, { new: true });
    return contract
}

exports.startScanning = async (address) => {
    const contract = await Contract.findOneAndUpdate({address: address.toLowerCase()}, {scannable: true}, { new: true });
    return contract
}

exports.stopScanning = async (address) => {
    const contract = await Contract.findOneAndUpdate({address: address.toLowerCase()}, {scannable: false}, { new: true });
    return contract
}

exports.clearEvents = async (address) => {
    const contract = await Contract.findOne({address: address.toLowerCase()});
    if (!contract) {
        return contract
    }
    const scannable = contract.scannable
    //如果原先服务未停止，暂停事件扫描任务
    if(scannable){
        await Contract.findOneAndUpdate({address: address.toLowerCase()}, {scannable: false});
    }
    await eventService.deleteEventsByAddress(address)
    //更新起始块
    return Contract.findOneAndUpdate({address: address.toLowerCase()}, {scannable, lastScannedBlock: contract.createdBlock ? contract.createdBlock : 0}, { new: true });
}
