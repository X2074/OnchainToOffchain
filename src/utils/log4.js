const path = require('path');//引入原生path模块
const log4js = require('koa-log4');//引入koa-log4
log4js.configure({
    appenders: {
        access: {
            type: 'dateFile',
            pattern: '-yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            encoding: "utf-8",
            filename: path.join('log/', 'access.log')
        },
        application: {
            type: 'dateFile',
            pattern: '-yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            encoding: "utf-8",
            filename: path.join('log/', 'application.log')
        },
        out: {
            type: 'console'
        }
    },
    categories: {
        default: {appenders: ['out'], level: 'info'},
        access: {appenders: ['access'], level: 'info'},
        application: {appenders: ['application'], level: 'info'}
    }
});
exports.accessLogger = () => log4js.koaLogger(log4js.getLogger('access'));
exports.logger = log4js.getLogger('application');
