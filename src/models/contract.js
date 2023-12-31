const mongoose = require('mongoose')

const {Schema, model} = mongoose

const contractSchema = new Schema({
    __v: {type: Number, select: false},
    address: {type: String, require: true, unique: true},
    name: {type: String, require: false},
    abi: {type: Array, require: true, select: false},
    createdBy: {type: String, require: false},
    createdHash: {type: String, require: false},
    createdTime: {type: Date, require: false},
    createdBlock: {type: Number, require: false},
    lastScannedBlock: {type: Number, default: 0},
    scannable: {type: Boolean, default: true},
    scanning: {type: Boolean, default: false}
})

module.exports = model('Contract', contractSchema)
