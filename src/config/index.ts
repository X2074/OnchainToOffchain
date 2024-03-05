import * as Joi from 'joi'
import * as process from 'process'

// 构建一个正则表达式来匹配MongoDB连接字符串
const mongodbUriRegex =
    /^mongodb:\/\/(?:[a-zA-Z0-9]+:[a-zA-Z0-9]+@)?[a-zA-Z0-9.]+:[0-9]+\/[a-zA-Z0-9_]+(?:\?[a-zA-Z0-9=&]+)?$/

/**
 * 对象验证逻辑
 */
const schema = Joi.object().keys({
    server: Joi.object({
        port: Joi.number().default(3000),
        env: Joi.string()
            .valid('development', 'production', 'test', 'provision')
            .default('production'),
    }),
    mongo_connection_uri: Joi.string().regex(mongodbUriRegex),
    block_batches: Joi.number().default(1000),
    bulk_save_batches: Joi.number().default(1000),
    web3: Joi.object({
        rpc: Joi.string().uri(),
    }),
    retry: Joi.object({
        max: Joi.number().positive().integer().min(1).default(3),
        delay: Joi.number().positive().integer().default(10000),
    }),
    log: Joi.object({
        on: Joi.boolean().default(true),
        level: Joi.string()
            .valid('error', 'warn', 'info', 'debug')
            .default('info'),
    }),
})

/**
 * 默认配置导出
 *
 */
export const getConfig = () => {
    const config = {
        server: {
            port: Number(process.env.SERVER_PORT) || 5000,
            env: process.env.NODE_ENV || 'production',
        },
        mongo_connection_uri:
            process.env.MONGO_CONNECTION_URI ||
            'mongodb://127.0.0.1:27017/qng_mainnet',
        block_batches: Number(process.env.BLOCK_BATCHES) || 1000,
        bulk_save_batches: Number(process.env.BULK_SAVE_BATCHES) || 1000,
        web3: {
            rpc: process.env.WEB3_RPC || 'https://testnet-qng.rpc.qitmeer.io',
        },
        retry: {
            max: Number(process.env.MAX_RETRIES) || 3,
            delay: Number(process.env.RETRY_DELAY) || 10000,
        },
        log: {
            on: Boolean(process.env.LOG_ON) || true,
            level: process.env.LOG_LEVEL || 'info',
        },
    }
    try {
        const { value, error } = schema.validate(config)
        if (error) {
            console.log(error)
        }
        return value
    } catch (error) {
        console.log(error)
        return {}
    }
}
