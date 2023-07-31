module.exports = {
    mongoConnectionStr: 'mongodb://localhost:27017/qng_mainnet',
    rpc: process.env.NODE_ENV === 'production' ? 'http://localhost:18545' : 'https://qng.rpc.qitmeer.io', //生产环境从本地节点直接读取数据
    batches: 100
}
