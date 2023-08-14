const mongoose = require('mongoose')

const { Schema, model } = mongoose

const addressSchema = new Schema({
    __v: {type: Number, select: false},
    address: {type: String, require: true, unique: true},
    balance: {type: String, default: '0'},
    token: {type: Array, default:[]},
    nft: {type: Array, default:[]}
})

module.exports = model('Address', addressSchema)
