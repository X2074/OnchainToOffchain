const mongoose = require('mongoose')

const { Schema, model } = mongoose

const transactionSchema = new Schema({
    hash: {type: String, require: true},
    block: {type: String, require: true},
    timestamp: {type: BigInt, require: true}
})

module.exports = model('Transaction', transactionSchema)
