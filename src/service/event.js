const Event = require('../models/event')
const dayjs = require('dayjs');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
const utc = require('dayjs/plugin/utc')
const {logger} = require("../utils/log4");
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

exports.getEventsStatistics = async (queryCriteria, groupField, unit, startTime, endTime, options) => {
    // 根据options涉及的字符串得到需要使用的信息
    var selectField = Object.keys(options).join(' ') + ' time'
    const groups = groupField.toLowerCase().split(' ').filter(item=>item!=='')
    if(groups.length>0){
        selectField += ' ' + groups.join(' ')
    }
    const groupFields = {}
    groups.forEach(group => {
        groupFields[group] = []
    })
    // 通过queryCriteria与selectField获取到待统计的数据
    const events = await Event.find(queryCriteria).select(selectField).exec();

    // 确认下每个要分组的数据的所有取值情况
    events.forEach(event => {
        logger.info(event)
        groups.forEach(group => {
            const keyList = group.split('.').reverse()
            let tmp = event
            while (keyList.length > 0) {
                logger.info(tmp)
                tmp = tmp[keyList.pop()]
            }
            if(groupFields[group].indexOf(tmp)<0){
                groupFields[group].push(tmp)
            }
        })
    })
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
    // 将原始记录按照时间和分组条件分片统计
    const statisticsData = {}
    times.forEach(time => {
        statisticsData[time] =  buildMultiLevelObject([...groups, 'options'], {...groupFields, options: Object.keys(options)});
    })
    logger.info(statisticsData)
    events.forEach(event => {
        const time = unit === 'all' ? 'all' : unit === 'hour' ? dayjs(event.time).utc().format('YYYY-MM-DD HH:00:00') : dayjs(event.time).utc().format('YYYY-MM-DD')
        const keyList = []
        for(let i=0; i<groups.length; i++){
            const keys = groups[i].split('.').reverse()
            let tmp = event
            while (keys.length > 0) {
                tmp = tmp[keys.pop()]
            }
            keyList.push(tmp)
        }
        let tmpdata = statisticsData[time]
        const keyListReverse = keyList.reverse()
        while(keyListReverse.length > 0){
            tmpdata = tmpdata[keyListReverse.pop()]
        }
        Object.keys(options).forEach(key => {
            const keyList2 = key.split('.').reverse()
            let tmp = event
            while (keyList2.length > 0) {
                tmp = tmp[keyList2.pop()]
            }
            tmpdata[key].push(tmp)
        })
    })
    logger.info(statisticsData)
    times.forEach(time => {
        statisticsData[time] = deepStatistics(statisticsData[time], options)
    })
    // 转换为数组格式
    const result = []
    times.forEach(time => {
        result.push({ time: time, ...statisticsData[time] })
    })
    return result
};

/**
 * 构建多级对象
 * @param list 分组字段 例如：["a", "b", "c", "d"]
 * @param obj 分组值 例如：{
 *     "a": ["a1", "a2"],
 *     "b": ["b1", "b2"],
 *     "c": ["c1", "c2", "c3"],
 *     "d": ["d1"]
 * }
 * @return {*|{}}
 * 例如：{
 *     a1: {
 *         b1: {c1: {d1: []}, c2: {d1: []}, c3: {d1: []}},
 *         b2: {c1: {d1: []}, c2: {d1: []}, c3: {d1: []}}
 *     },
 *     a2: {
 *         b1: {c1: {d1: []}, c2: {d1: []}, c3: {d1: []}},
 *         b2: {c1: {d1: []}, c2: {d1: []}, c3: {d1: []}}
 *     }
 * }
 */
function buildMultiLevelObject(list, obj) {
    function recursiveBuild(keys) {
        if (keys.length === 0) {
            return new Array();
        }

        const key = keys.shift();
        const nestedObject = {};
        const values = obj[key];
        for (const v of values) {
            nestedObject[v] = recursiveBuild([...keys]);
        }
        return nestedObject;
    }

    const result = recursiveBuild([...list]);
    return result;
}

function deepStatistics(obj, options) {
    Object.keys(obj).forEach(key=>{
        if(Array.isArray(obj[key])){
            switch (options[key]) {
                case 'count'://去重计数
                    obj[key] = obj[key].reduce((accumulator, value) => {
                        return accumulator.includes(value) ? accumulator : [...accumulator, value];
                    }, []).length;
                    break;
                case 'sum'://求和
                    obj[key] = obj[key].reduce((accumulator, current) => {
                        return accumulator + BigInt(current);
                    }, 0n).toString();
                    break;
                case 'average'://求均值
                    obj[key] = (obj[key].reduce((accumulator, current) => {
                        return accumulator + BigInt(current);
                    }, 0n) / BigInt(list.length)).toString();
                    break;
                case 'min'://求最小值
                    obj[key] = obj[key].reduce((accumulator, current) => {
                        return accumulator < BigInt(current) ? accumulator : BigInt(current);
                    }, 0n).toString();
                    break;
                case 'max'://求最大值
                    obj[key] = obj[key].reduce((accumulator, current) => {
                        return accumulator > BigInt(current) ? accumulator : BigInt(current);
                    }, 0n).toString();
                    break;
            }
        }else {
            obj[key] = deepStatistics(obj[key],options)
        }
    })
    return obj
}
