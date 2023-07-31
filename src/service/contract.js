const Contract = require('../models/contract')
const eventService  = require('./event')

exports.find = async () => {
    return Contract.find();
}

exports.findDetail = async () => {
    return Contract.find().select('+abi');
}

exports.findByAddress = async (address) => {
    return Contract.findOne({address: address.toLowerCase()});
}

exports.findDetailByAddress = async (address) => {
    return Contract.findOne({address: address.toLowerCase()}).select('+abi');
}

exports.deleteByAddress = async (address) =>{
    const contract = await Contract.findOneAndRemove({address: address.toLowerCase()})
    await eventService.deleteEventsByAddress(address)
    return contract
}

exports.addContract = async (contractData) => {
    return await new Contract(contractData).save()
}

exports.update = async (address, contractData) => {
    return Contract.findOneAndUpdate({address: address.toLowerCase()}, contractData);
}

exports.startScanning = async (address) => {
    return Contract.findOneAndUpdate({address: address.toLowerCase()}, {scannable: true});
}

exports.stopScanning = async (address) => {
    return Contract.findOneAndUpdate({address: address.toLowerCase()}, {scannable: false});
}

exports.clearEvents = async (address) => {
    //暂停事件扫描任务
    const contract = await Contract.findOneAndUpdate({address: address.toLowerCase()},{scannable: false})
    if(!contract) { return contract}
    await eventService.deleteEventsByAddress(address)
    //重启事件扫描任务，并更新起始块
    return Contract.findOneAndUpdate({address: address.toLowerCase()}, {
        scannable: false,
        lastScannedBlock: contract.createdBlock ? contract.createdBlock : 0
    });
}
