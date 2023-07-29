const Event = require('../models/event')

exports.addEvent = async (eventData) => {
    eventData.address = eventData.address.toLowerCase()
    const event = new Event(eventData).save()
    return event
}
exports.deleteEventsByAddress = async (address) => {
    Event.deleteMany({address: address.toLowerCase()})
}
