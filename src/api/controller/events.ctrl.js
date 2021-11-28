const noop = (req, res, next) => res.status(200).send('noop').end()

module.exports = Object.assign({}, {
  getSeasonEventsWithID: async (req, res, next) => { return noop(req, res, next) },
  createEvent: async (req, res, next) => { return noop(req, res, next) },
  getEventWithID: async (req, res, next) => { return noop(req, res, next) },
  updateEventWithID: async (req, res, next) => { return noop(req, res, next) },
  deleteEventWithID: async (req, res, next) => { return noop(req, res, next) },
})
