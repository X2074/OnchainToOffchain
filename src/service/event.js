const Event = require('../models/event')
const dayjs = require('dayjs');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
const utc = require('dayjs/plugin/utc')
dayjs.extend(isSameOrBefore)
dayjs.extend(utc)

exports.addEvent = async (eventData) => {
    eventData.address = eventData.address.toLowerCase()
    return new Event(eventData).save()
}

exports.deleteEventsByAddress = async (address) => {
    const events = await Event.deleteMany({address: address.toLowerCase()})
    return events
}
exports.countByAddress = async (address) => {
    const total = await Event.countDocuments({address: address.toLowerCase()})
    return total
}
exports.findByAddress = async (address, page, pageSize) => {
    const total = await Event.countDocuments({address: address.toLowerCase()})
    const events = await Event
        .find({address: address.toLowerCase()})
        .skip((page - 1) * pageSize) // 跳过前面的页数
        .limit(pageSize) // 指定每页的大小
        .exec(); // 执行查询
    return {total: total, events: events, page: page, pageSize: pageSize}
}

exports.find = async (queryCriteria, selectField, sortCriteria, page, pageSize) => {
    const total = await Event.countDocuments(queryCriteria)
    const events = await Event
        .find(queryCriteria)
        .select(selectField)
        .sort(sortCriteria)// 多字段排序条件 例如：{time: 1, event: -1} 表示先按时间正序，再按时间倒序

        .skip((page - 1) * pageSize) // 跳过前面的页数
        .limit(pageSize) // 指定每页的大小
        .exec(); // 执行查询
    return {total: total, events: events, page: page, pageSize: pageSize}
}

exports.getEventsStatistics = async (queryCriteria, unit, startTime, endTime, options) => {
    // 根据options涉及的字符串得到需要使用的信息
    const selectField = Object.keys(options).join(' ') + ' time'
    // 通过queryCriteria与selectField获取到待统计的数据
    const events = await Event.find(queryCriteria).select(selectField).exec();
    const times = []
    if(unit === 'all'){
        times.push('all')
    }else{
        let currentTime = dayjs(startTime).utc().startOf(unit)
        const lastTime = dayjs(endTime).utc().startOf(unit)
        while (currentTime.isSameOrBefore(lastTime)) {
            if (unit === 'hour') {
                times.push(currentTime.format('YYYY-MM-DD HH:00:00'))
            } else {
                times.push(currentTime.format('YYYY-MM-DD'))
            }
            currentTime = currentTime.add(1, unit)
        }
    }
    // 将原始记录按照时间分片统计
    const statisticsData = {}
    times.forEach(time => {
        statisticsData[time] = {}
        Object.keys(options).forEach(key => {
            statisticsData[time][key] = []
        })
    })
    events.forEach(event => {
        const time = unit === 'all' ? 'all' : unit === 'hour' ? dayjs(event.time).utc().format('YYYY-MM-DD HH:00:00') : dayjs(event.time).utc().format('YYYY-MM-DD')
        Object.keys(options).forEach(key => {
            const keyList = key.split('.').reverse()
            let tmp = event
            while (keyList.length > 0) {
                tmp = tmp[keyList.pop()]
            }
            statisticsData[time][key].push(tmp)
        })
    })
    times.forEach(time => {
        Object.keys(options).forEach(key => {
            const tmpData = statisticsData[time][key]
            // 按照操作类型进行处理
            switch (options[key]) {
                case 'count'://去重计数
                    statisticsData[time][key] = tmpData.reduce((accumulator, value) => {
                        return accumulator.includes(value) ? accumulator : [...accumulator, value];
                    }, []).length;
                    break;
                case 'sum'://求和
                    statisticsData[time][key] = tmpData.reduce((accumulator, current) => {
                        return accumulator + BigInt(current);
                    }, 0n).toString();
                    break;
                case 'average'://求均值
                    statisticsData[time][key] = (tmpData.reduce((accumulator, current) => {
                        return accumulator + BigInt(current);
                    }, 0n) / BigInt(tmpData.length)).toString();
                    break;
                case 'min'://求最小值
                    statisticsData[time][key] = tmpData.reduce((accumulator, current) => {
                        return accumulator < BigInt(current) ? accumulator : BigInt(current);
                    }, 0n).toString();
                    break;
                case 'max'://求最大值
                    statisticsData[time][key] = tmpData.reduce((accumulator, current) => {
                        return accumulator > BigInt(current) ? accumulator : BigInt(current);
                    }, 0n).toString();
                    break;
            }
        })
    })
    // 转换为数组格式
    const result = []
    times.forEach(time => {
        result.push({ time: time, ...statisticsData[time] })
    })
    return result
};
