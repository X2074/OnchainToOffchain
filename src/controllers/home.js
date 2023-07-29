class HomeCtl {
    index(ctx){
        ctx.body = 'Onchain To Offchain Server is Working well!'
    }
}
module.exports = new HomeCtl()
