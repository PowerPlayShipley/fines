const controller = require('../controller/events.ctrl')

module.exports = (router) => {
  router.get('/leagues/:league/events', controller.getLeagueEventsWithID)
  router.post('/leagues/:league/events', controller.createEvent)

  router.get('/leagues/:league/events/:event', controller.getEventWithID)
  router.patch('/leagues/:league/events/:event', controller.updateEventWithID)
  router.delete('/leagues/:league/events/:event', controller.deleteEventWithID)
}
