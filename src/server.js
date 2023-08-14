const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const {mongoConnectionStr, listenPort} = require('./config')
const mongoose = require('mongoose')
const routing = require('./routes')
const {accessLogger, logger,} = require('./utils/log4')
const CronJob = require('cron').CronJob;
const {scanContractsEvents, scanTransactions} = require('./utils/cronJobs')
const {program} = require('commander');
const fs = require('fs')
// 接收命令行参数来决定是否清空文档集合
program.option('-c, --clear', 'Clear the document collection before starting the task');
program.parse(process.argv);
const shouldClearCollection = program.opts().clear || false;

// 在启动函数中根据命令行参数来决定是否清空文档集合
async function startServer() {
    // 链接MongoDB
    mongoose.connect(mongoConnectionStr, {useNewUrlParser: true})
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'))
    db.once('open', async function () {
        console.log('MongoDB connected!')
        // 清空文档集合
        if (shouldClearCollection) {
            // 获取MongoDB数据库对象
            const database = db.db;
            // 检查集合是否存在
            const collections = await database.listCollections().toArray();
            for (const file of fs.readdirSync(__dirname + '/models')) {
                const Model = require(__dirname + `/models/${file}`)
                const collectionNameToDelete = Model.collection.name
                const collectionExists = collections.some((collection) => collection.name === collectionNameToDelete);
                if (collectionExists) {
                    // 如果集合存在，则删除它
                    await database.dropCollection(collectionNameToDelete);
                    logger.info(`Collection "${collectionNameToDelete}" has been deleted.`);
                } else {
                    logger.info(`Collection "${collectionNameToDelete}" does not exist.`);
                }
            }
        }
    });



    // 启动定时任务
    /** 定义规则,cron表达式
     * * * * * * *
     * ┬ ┬ ┬ ┬ ┬ ┬
     * │ │ │ │ │ │
     * │ │ │ │ │ └ day of week (0 - 7) (0 or 7 is Sun)
     * │ │ │ │ └───── month (1 - 12)
     * │ │ │ └────────── day of month (1 - 31)
     * │ │ └─────────────── hour (0 - 23)
     * │ └──────────────────── minute (0 - 59)
     * └───────────────────────── second (0 - 59, OPTIONAL)
     */

    /**
     * 定期获取合约事件 5分钟执行一次
     */
    new CronJob('0 */5 * * * *', function () {
        scanContractsEvents()
    }, null, true)
    /**
     * 定期获取交易记录 5分钟执行一次
     */
    new CronJob('0 */5 * * * *', function () {
        scanTransactions()
    }, null, true)
    // 记录访问日志
    app.use(accessLogger())
    // 记录失败日志
    app.on('error', err => {
        logger.error(err)
    });
    // 生产环境不返回堆栈信息
    app.use(error({
        postFormat: (e, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? rest : {stack, ...rest}
    }))
    app.use(bodyParser())
    app.use(parameter(app))
    routing(app)
    app.listen(listenPort, () => {
        console.log(`Server run at http://localhost:${listenPort}/`)
    })

}

// 启动服务
startServer()
