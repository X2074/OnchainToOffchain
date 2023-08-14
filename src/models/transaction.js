const mongoose = require('mongoose')

const { Schema, model } = mongoose

const transactionSchema = new Schema({
    __v: {type: Number, select: false},
    hash: {type: String, require: true, unique: true},
    blockHash: {type: String, require: true, index: true},
    blockNumber: {type: Number, require: true},
    time: {type: Date, require: true, index: true}, //对时间索引
    from: {type: String, require: true},
    gas: {type: String, require: true},
    gasPrice: {type: String, require: true},
    input: {type: String, require: true},
    nonce: {type: String, require: true},
    to: {type: String, require: false},
    transactionIndex: {type: Number, require: true},
    value: {type: String, require: true},
    type: {type: String, require: false},
    chainId: {type: Number, require: false},
    v: {type: String, require: false},
    r: {type: String, require: false},
    s: {type: String, require: false},
})
transactionSchema.index({blockNumber: -1, transactionIndex: -1});

module.exports = model('Transaction', transactionSchema)
