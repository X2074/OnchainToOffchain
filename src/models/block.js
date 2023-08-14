const mongoose = require('mongoose')

const { Schema, model } = mongoose

const blockSchema = new Schema({
    __v: {type: Number, select: false},
    hash: {type: String, require: true, unique: true},
    number: {type: Number, require: true},
    time: {type: Date, require: true, index: true}, //对时间索引
    timestamp: {type: Number, require: true},
    difficulty: {type: String, require: true},
    extraData: {type: String, require: true},
    gasLimit: {type: String, require: true},
    gasUsed: {type: String, require: true},
    logsBloom: {type: String, require: true},
    miner: {type: String, require: true},
    mixHash: {type: String, require: true},
    nonce: {type: String, require: true},
    parentHash: {type: String, require: true},
    sha3Uncles: {type: String, require: true},
    size: {type: Number, require: true},
    stateRoot: {type: String, require: true},
    totalDifficulty: {type: String, require: true},
    transactionsRoot: {type: String, require: true},
    uncles: {type: Array, require: true}
})

module.exports = model('Block', blockSchema)
