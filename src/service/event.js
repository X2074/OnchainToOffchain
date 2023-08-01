const Event = require('../models/event')

exports.addEvent = async (eventData) => {
    eventData.address = eventData.address.toLowerCase()
    return new Event(eventData).save()
}
exports.deleteEventsByAddress = async (address) => {
    const events = await Event.deleteMany({address: address.toLowerCase()})
    return events
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
        .find(queryCriteria)// 查询条件
        .select(selectField)
        .sort(sortCriteria)// 多字段排序条件 例如：{time: 1, event: -1} 表示先按时间正序，再按时间倒序

        .skip((page - 1) * pageSize) // 跳过前面的页数
        .limit(pageSize) // 指定每页的大小
        .exec(); // 执行查询
    return {total: total, events: events, page: page, pageSize: pageSize}
}
