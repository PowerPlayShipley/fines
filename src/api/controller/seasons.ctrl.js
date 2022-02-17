const toMongodb = require('jsonpatch-to-mongodb')

const config = require('../../config')

const datastore = require('../../dao/database')
const { ROUTING_KEY_SEASON_UPDATED } = require("../../dao/events/constants");

module.exports = Object.assign({}, {
  getSeasons: async (req, res, next) => {
    let response

    try {
      response = await datastore.find(config.get('collection-seasons'))({})
    } catch (err) {
      return next(err)
    }

    return res.status(200).json({
      meta: {
        status: 200,
        requestId: req.id
      },
      data: response
    })
  },
  createSeason: async (req, res, next) => {
    const body = req.body

    let response
    try {
      response = await datastore.insert(config.get('collection-seasons'))(body)
    } catch (err) {
      return next(err)
    }

    return res.status(201).json({
      meta: {
        status: 201,
        id: response._id.toString(),
        requestId: req.id
      },
      data: response
    })
  },
  getSeasonWithID: async (req, res, next) => {
    const { season } = req.params

    let response
    try {
      response = await datastore.findOneWithId(config.get('collection-seasons'))(season)
    } catch (err) {
      return next(err)
    }

    return res.status(200).json({
      meta: {
        status: 200,
        id: response._id,
        requestId: req.id
      },
      data: response
    })
  },
  updateSeasonWithID: async (req, res, next) => {
    const { season } = req.params
    // This is so we know which session sent the request if we got it
    const realtimeSession = req.get('X-REALTIME-SESSION')
    realtimeSession && require('../../utils/log').http('seasons:controller', { season, realtimeSession }, 'Updated via realtime')

    const data = req.body

    let response
    try {
      const patches = toMongodb(Array.isArray(data) ? data : [data])

      response = await datastore.findOneAndUpdateWithId(config.get('collection-seasons'))(season, patches)
      req.eventStream && req.eventStream.emit(ROUTING_KEY_SEASON_UPDATED, response, realtimeSession)
    } catch (err) {
      return next(err)
    }

    return res.status(200).json({
      meta: {
        status: 200,
        id: response._id,
        requestId: req.id
      },
      data: response
    })
  },
  deleteSeasonsWithID: async (req, res, next) => {
    const { season } = req.params

    try {
      await datastore.delete(config.get('collection-seasons'))(season)
    } catch (err) {
      return next(err)
    }

    return res.status(204).end()
  },
})
