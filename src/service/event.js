const Event = require('../models/event')

exports.addEvent = async (eventData) => {
    const event = new Event(eventData).save()
    return event
}
