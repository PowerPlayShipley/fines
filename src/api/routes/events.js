const controller = require('../controller/events.ctrl')
const { patch, post } = require('../../middleware/validation')

module.exports = (router) => {
  router.get('/seasons/:season/events', controller.getSeasonEventsWithID)
  router.post('/seasons/:season/events', post('event'), controller.createEvent)

  router.get('/seasons/:season/events/:event', controller.getEventWithID)
  router.patch('/seasons/:season/events/:event', patch, controller.updateEventWithID)
  router.delete('/seasons/:season/events/:event', controller.deleteEventWithID)
}
