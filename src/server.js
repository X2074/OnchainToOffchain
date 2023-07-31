const Koa = require('koa')
const app = new Koa()
const bodyParser = require('koa-bodyparser')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const { mongoConnectionStr } = require('./config')
const mongoose= require('mongoose')
const routing = require('./routes')
const { accessLogger,logger, } = require('./utils/log4')
const CronJob = require('cron').CronJob;
const { scanContracts } = require('./utils/cronJobs')

// 链接MongoDB
mongoose.connect(mongoConnectionStr, { useNewUrlParser: true })
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
    console.log('MongoDB connected!')
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
new CronJob('0 */1 * * * *', function() {
    scanContracts()
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
app.listen(5000,()=> {console.log('Server run at http://localhost:5000/')})
