const controller = require('../controller/leagues.ctrl')

module.exports = (router) => {
  router.get('/leagues', controller.getLeagues)
  router.post('/leagues', controller.createLeague)

  router.get('/leagues/:league', controller.getLeagueWithID)
  router.patch('/leagues/:league', controller.updateLeagueWithID)
  router.delete('/leagues/:league', controller.deleteLeagueWithID)
}
