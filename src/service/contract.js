const Contract = require('../models/contract')
const eventService  = require('./event')

exports.find = async () => {
    const contracts = await Contract.find();
    return contracts
}

exports.findDetail = async () => {
    const contracts = await Contract.find().select('+abi');
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

exports.deleteByAddress = async (address) =>{
    const contract = await Contract.findOneAndRemove({address: address.toLowerCase()})
    await eventService.deleteEventsByAddress(address)
    return contract
}

exports.addContract = async (contractData) => {
    const contract = await new Contract(contractData).save()
    return contract
}

exports.update = async (address, contractData) => {
    const contract = await Contract.findOneAndUpdate({address: address.toLowerCase()}, contractData);
    return contract
}

exports.startScanning = async (address) => {
    const contract = await Contract.findOneAndUpdate({address: address.toLowerCase()}, {scannable: true});
    return contract
}

exports.stopScanning = async (address) => {
    const contract = await Contract.findOneAndUpdate({address: address.toLowerCase()}, {scannable: false});
    return contract
}

exports.clearEvents = async (address) => {
    //暂停事件扫描任务
    const contract = await Contract.findOneAndUpdate({address: address.toLowerCase()},{scannable: false})
    if(!contract) { return contract }
    await eventService.deleteEventsByAddress(address)
    //重启事件扫描任务，并更新起始块
    return Contract.findOneAndUpdate({address: address.toLowerCase()}, {
        scannable: false,
        lastScannedBlock: contract.createdBlock ? contract.createdBlock : 0
    });
}
