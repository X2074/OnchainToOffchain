const Contract = require('../models/contract')
const Event = require('../models/event')
class HomeCtl {
    async index(ctx){
        ctx.body = 'Onchain To Offchain Server is Working well!'
    }

    async dropCollections(ctx){
        await Contract.collection.drop()
        await Event.collection.drop()
        ctx.status = 204
    }
}
module.exports = new HomeCtl()
