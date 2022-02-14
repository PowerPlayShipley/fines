/**
 * Add an event stream channel to a controller
 *
 * This channel will be statically created after the first call to this and using
 * a singleton like pattern the subsequent calls will use the same channel
 * */

const events = require("../dao/events");

module.exports = async (req, res, next) => {
  if (events.state !== events.STATE.connected) return next()

  const channel = await events.channel()
  Object.defineProperty(req, 'eventStream', {
    get: () => channel
  })
  return next()
}
