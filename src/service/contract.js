const Contract = require('../models/contract')

exports.find = async () => {
    const contracts = await Contract.find()
    return contracts
}

exports.findDetail = async () => {
    const contracts = await Contract.find().select('+abi')
    return contracts
}

exports.findByAddress = async (address) => {
    const contract = await Contract.findOne({address: address.toLowerCase()})
    return contract
}

exports.findDetailByAddress = async (address) => {
    const contract = await Contract.findOne({address: address.toLowerCase()}).select('+abi')
    return contract
}

exports.deleteByAddress = async (address) =>{
    const contract = await Contract.findOneAndRemove({address: address.toLowerCase()})
    return contract
}

exports.addContract = async (contractData) => {
    const contract = await new Contract(contractData).save()
    return contract
}
