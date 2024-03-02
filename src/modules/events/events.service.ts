import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Event, EventDocument} from '@/schema/event.schema';

const dayjs = require('dayjs');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore')
const utc = require('dayjs/plugin/utc')
const quarterOfYear = require('dayjs/plugin/quarterOfYear')
const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(isSameOrBefore)
dayjs.extend(utc)
dayjs.extend(quarterOfYear)
dayjs.extend(weekOfYear)

@Injectable()
export class EventsService {
    constructor(
        @InjectModel(Event.name, 'qng_mainnet')
        private readonly eventModel: Model<EventDocument>
    ) {
    }

    async create(eventData) {
        eventData.address = eventData.address.toLowerCase()
        const createdEvent = await this.eventModel.create(eventData);
        return createdEvent
    }

    async deleteByAddress(address) {
        const events = await this.eventModel.deleteMany({address: address.toLowerCase()}).exec();
        return events
    }

    async find(queryCriteria, selectField, sortCriteria, page, pageSize): Promise<{
        total: number;
        events: Event[];
        page: number;
        pageSize: number
    }> {
        const total = await this.eventModel.countDocuments(queryCriteria).exec();
        const events = await this.eventModel
            .find(queryCriteria)
            .select(selectField)
            .sort(sortCriteria)// 多字段排序条件 例如：{time: 1, event: -1} 表示先按时间正序，再按时间倒序
            .skip((page - 1) * pageSize) // 跳过前面的页数
            .limit(pageSize) // 指定每页的大小
            .exec(); // 执行查询
        return {total, events, page, pageSize}
    }

    async countByAddress(address) {
        const total = await this.eventModel.countDocuments({address: address.toLowerCase()}).exec();
        return total
    }

    async findByAddress(address, page, pageSize) {
        const total = await this.eventModel.countDocuments({address: address.toLowerCase()})
        const events = await this.eventModel
            .find({address: address.toLowerCase()})
            .skip((page - 1) * pageSize) // 跳过前面的页数
            .limit(pageSize) // 指定每页的大小
            .exec(); // 执行查询
        return {total: total, events: events, page: page, pageSize: pageSize}
    }

    async getEventsStatistics(queryCriteria, groupField, unit, startTime, endTime, options) {
        // 根据options涉及的字符串得到需要使用的信息
        var selectField = Object.keys(options).join(' ') + ' time'
        const groups = groupField.split(' ').filter(item => item !== '')
        if (groups.length > 0) {
            selectField += ' ' + groups.join(' ')
        }
        const groupFields = {}
        groups.forEach(group => {
            groupFields[group] = []
        })
        // 通过queryCriteria与selectField获取到待统计的数据
        const events = await this.eventModel.find(queryCriteria).select(selectField).exec();

        // 确认下每个要分组的数据的所有取值情况
        events.forEach(event => {
            groups.forEach(group => {
                const keyList = group.split('.').reverse()
                let tmp = event
                while (keyList.length > 0) {
                    tmp = tmp[keyList.pop()]
                }
                if (groupFields[group].indexOf(tmp) < 0) {
                    groupFields[group].push(tmp)
                }
            })
        })
        const times = []
        if (unit === 'all') {
            times.push('all')
        } else {
            let currentTime = dayjs(startTime).utc().startOf(unit)
            const lastTime = dayjs(endTime).utc().startOf(unit)
            while (currentTime.isSameOrBefore(lastTime)) {
                switch (unit) {
                    case 'hour':
                        times.push(currentTime.format('YYYY-MM-DD HH:00:00'));
                        break;
                    case 'day':
                        times.push(currentTime.format('YYYY-MM-DD'));
                        break;
                    case 'week':
                        times.push(currentTime.format('YYYY') + '-W' + String(currentTime.week()).padStart(2, '0')); // 表示年份和该年中的周数，例如 "2023-W15"
                        break;
                    case 'month':
                        times.push(currentTime.format('YYYY-MM'));
                        break;
                    case 'quarter':
                        times.push(currentTime.format('YYYY') + '-Q' + currentTime.quarter()); // 表示年份和季度
                        break;
                    case 'year':
                        times.push(currentTime.format('YYYY'));
                        break;
                    default: // 默认按天处理
                        times.push(currentTime.format('YYYY-MM-DD'));
                        break;

                }
                currentTime = currentTime.add(1, unit)
            }
        }
        // 将原始记录按照时间和分组条件分片统计
        const statisticsData = {}
        times.forEach(time => {
            statisticsData[time] = this.buildMultiLevelObject([...groups, 'options'], {
                ...groupFields,
                options: Object.keys(options)
            });
        })
        events.forEach(event => {
            let time;
            switch (unit) {
                case 'all':
                    time = 'all';
                    break;
                case 'hour':
                    time = dayjs(event.time).utc().format('YYYY-MM-DD HH:00:00');
                    break;
                case 'day':
                    time = dayjs(event.time).utc().format('YYYY-MM-DD');
                    break;
                case 'week':
                    time = dayjs(event.time).utc().format('YYYY') + '-W' + String(dayjs(event.time).utc().week()).padStart(2, '0');
                    break;
                case 'month':
                    time = dayjs(event.time).utc().format('YYYY-MM');
                    break;
                case 'quarter':
                    time = dayjs(event.time).utc().format('YYYY') + '-Q' + dayjs(event.time).utc().quarter();
                    break;
                case 'year':
                    time = dayjs(event.time).utc().format('YYYY');
                    break;
                default: // 默认按天处理
                    time = dayjs(event.time).utc().format('YYYY-MM-DD');
                    break;
            }
            const keyList = []
            for (let i = 0; i < groups.length; i++) {
                const keys = groups[i].split('.').reverse()
                let tmp = event
                while (keys.length > 0) {
                    tmp = tmp[keys.pop()]
                }
                keyList.push(tmp)
            }
            let tmpdata = statisticsData[time]
            const keyListReverse = keyList.reverse()
            while (keyListReverse.length > 0) {
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
        times.forEach(time => {
            statisticsData[time] = this.deepStatistics(statisticsData[time], options)
        })
        // 转换为数组格式
        const result = []
        times.forEach(time => {
            result.push({time: time, ...statisticsData[time]})
        })
        return result
    };

    /**
     * Build multi-level objects
     * @param list Grouping fields, for example: ["a", "b", "c", "d"]
     * @param obj Group values, for example: {
     *     "a": ["a1", "a2"],
     *     "b": ["b1", "b2"],
     *     "c": ["c1", "c2", "c3"],
     *     "d": ["d1"]
     * }
     * @return {*|{}}
     * Example: {
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
    buildMultiLevelObject(list, obj) {
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

    deepStatistics(obj, options) {
        Object.keys(obj).forEach(key => {
            if (Array.isArray(obj[key])) {
                switch (options[key]) {
                    case 'count':
                        obj[key] = obj[key].reduce((accumulator, value) => {
                            return accumulator.includes(value) ? accumulator : [...accumulator, value];
                        }, []).length;
                        break;
                    case 'sum':
                        obj[key] = obj[key].reduce((accumulator, current) => {
                            return accumulator + BigInt(current);
                        }, 0n).toString();
                        break;
                    case 'average':
                        obj[key] = (obj[key].reduce((accumulator, current) => {
                            return accumulator + BigInt(current);
                        }, 0n) / BigInt(obj[key].length)).toString();
                        break;
                    case 'min':
                        obj[key] = obj[key].reduce((accumulator, current) => {
                            return accumulator < BigInt(current) ? accumulator : BigInt(current);
                        }, 0n).toString();
                        break;
                    case 'max':
                        obj[key] = obj[key].reduce((accumulator, current) => {
                            return accumulator > BigInt(current) ? accumulator : BigInt(current);
                        }, 0n).toString();
                        break;
                }
            } else {
                obj[key] = this.deepStatistics(obj[key], options)
            }
        })
        return obj
    }
}
