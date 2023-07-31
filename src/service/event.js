const Event = require('../models/event')

exports.addEvent = async (eventData) => {
    eventData.address = eventData.address.toLowerCase()
    return new Event(eventData).save()
}
exports.deleteEventsByAddress = async (address) => {
    const events = await Event.deleteMany({address: address.toLowerCase()})
    console.log(address)
    console.log(events)
    return events
}
exports.findByAddress = async (address) => {
    const events = await Event.find({address: address.toLowerCase()})
    return events
}
exports.find = async (queryCriteria, selectField, sortCriteria, page, pageSize) => {
    const events = await Event
        .find(queryCriteria)// 查询条件
        .select(selectField)
        .sort(sortCriteria)// 多字段排序条件 例如：{time: 1, event: -1} 表示先按时间正序，再按时间倒序

        .skip((page - 1) * pageSize) // 跳过前面的页数
        .limit(pageSize) // 指定每页的大小
        .exec(); // 执行查询
    return events
}
