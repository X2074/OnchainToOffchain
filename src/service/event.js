const Event = require('../models/event')

exports.addEvent = async (eventData) => {
    eventData.address = eventData.address.toLowerCase()
    return new Event(eventData).save()
}
exports.deleteEventsByAddress = async (address) => {
    Event.deleteMany({address: address.toLowerCase()})
}
exports.findByAddress = async (address) => {
    return Event.find({address: address.toLowerCase()})
}
exports.find = async (queryCriteria,sortCriteria,page,pageSize) => {
    return Event
        .find(queryCriteria)// 查询条件
        .sort(sortCriteria)// 多字段排序条件 例如：{time: 1, event: -1} 表示先按时间正序，再按时间倒序

        .skip((page - 1) * pageSize) // 跳过前面的页数
        .limit(pageSize) // 指定每页的大小
        .exec(); // 执行查询
}
