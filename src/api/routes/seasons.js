const controller = require('../controller/seasons.ctrl')
const { patch, post } = require('../../middleware/validation')
const stream = require('../../middleware/event')

module.exports = (router) => {
  router.get('/seasons', controller.getSeasons)
  router.post('/seasons', post('season'), controller.createSeason)

  router.get('/seasons/:season', controller.getSeasonWithID)
  router.patch('/seasons/:season', stream, patch, controller.updateSeasonWithID)
  router.delete('/seasons/:season', controller.deleteSeasonsWithID)
}
