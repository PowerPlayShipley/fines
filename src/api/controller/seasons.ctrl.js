const noop = (req, res, next) => res.status(200).send('noop').end()

module.exports = Object.assign({}, {
  getSeasons: async (req, res, next) => { return noop(req, res, next) },
  createSeason: async (req, res, next) => { return noop(req, res, next) },
  getSeasonWithID: async (req, res, next) => { return noop(req, res, next) },
  updateSeasonWithID: async (req, res, next) => { return noop(req, res, next) },
  deleteSeasonsWithID: async (req, res, next) => { return noop(req, res, next) },
})
