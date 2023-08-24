module.exports = {
    listenPort: 5000,
    mongoConnectionStr: 'mongodb://localhost:27017/qng_mainnet',
    rpc: process.env.NODE_ENV === 'production' ? 'http://localhost:18545' : 'https://qng.rpc.qitmeer.io', //生产环境从本地节点直接读取数据
    block_batches: 1000,
    bulk_save_batches: 1000
}
