const mongoose = require('mongoose')

const { Schema, model } = mongoose

const eventSchema = new Schema({
    __v: {type: Number, select: false},
    address: {type: String, require: true},
    blockNumber: {type: Number, require: true},
    blockHash: {type: String, require: true},
    time: {type: Date, require: true},
    transactionHash: {type: String, require: true},
    transactionIndex: {type: BigInt, require: true},
    topics: {type: Array, require: true},
    data: {type: String, require: true},
    logIndex: {type: BigInt, require: true},
    removed: {type: Boolean, require: true},
    returnValues: {type: Object, require: true},
    event: {type: String, require: true},
    signature: {type: String, require: true},
    raw: {type: Array, require: true}
})

module.exports = model('Event', eventSchema)
