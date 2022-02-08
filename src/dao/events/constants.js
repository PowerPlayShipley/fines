module.exports = { }

module.exports.ROUTING_KEY_EVENTS_UPDATED  = 'events:fines:events:updated'

module.exports.ROUTING_KEY_SEASON_UPDATED = 'events:fines:season:updated'

// These are events from the stream, they are raw objects that need to be checked and validated
// before being updated
module.exports.STREAM_ROUTING_KEY_SEASON_UPDATED = 'events:stream:season:updated'
