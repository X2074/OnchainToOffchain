const mongoose = require('mongoose')

const { Schema, model } = mongoose

const eventSchema = new Schema({
    __v: {type: Number, select: false},
    address: {type: String, require: true, index: true}, //对地址索引
    blockNumber: {type: Number, require: true},
    blockHash: {type: String, require: true},
    time: {type: Date, require: true, index: true}, //对时间索引
    transactionHash: {type: String, require: true, unique: true},
    transactionIndex: {type: Number, require: true},
    topics: {type: Array, require: true},
    data: {type: String, require: true},
    logIndex: {type: Number, require: true},
    removed: {type: Boolean, require: true},
    returnValues: {type: Object, require: true},
    event: {type: String, require: true, index: true}, //对事件索引
    signature: {type: String, require: true},
    raw: {type: Array, require: true}
})
//根据时间建立倒序索引
eventSchema.index({time: -1})

module.exports = model('Event', eventSchema)
