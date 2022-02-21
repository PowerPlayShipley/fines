const toMongodb = require('jsonpatch-to-mongodb')
const { NotFound } = require('@hndlr/errors')

const config = require('../../config')

const datastore = require('../../dao/database')
const { ROUTING_KEY_EVENTS_UPDATED } = require("../../dao/events/constants");

module.exports = Object.assign({}, {
  getSeasonEventsWithID: async (req, res, next) => {
    const { season } = req.params

    let response

    try {
      response = await datastore.find(config.get('collection-events'))({ season }, '_id season round type')
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
  createEvent: async (req, res, next) => {
    const body = req.body

    let response
    try {
      response = await datastore.insert(config.get('collection-events'))(body)
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
  getEventWithID: async (req, res, next) => {
    const { event } = req.params

    let response
    try {
      response = await datastore.findOneWithId(config.get('collection-events'))(event)
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
  updateEventWithID: async (req, res, next) => {
    const { event } = req.params
    // This is so we know which session sent the request if we got it
    const realtimeSession = req.get('X-REALTIME-SESSION')
    realtimeSession && require('../../utils/log').http('events:controller', { event, realtimeSession }, 'Updated via realtime')

    const data = req.body

    let response
    try {
      const patches = toMongodb(Array.isArray(data) ? data : [data])

      response = await datastore.findOneAndUpdateWithId(config.get('collection-events'))(event, patches)
      if (!response) return next(new NotFound(`Could not find ${event}`))

      req.eventStream && req.eventStream.emit(ROUTING_KEY_EVENTS_UPDATED, response, realtimeSession)
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
  deleteEventWithID: async (req, res, next) => {
    const { event } = req.params

    try {
      const response = await datastore.delete(config.get('collection-events'))(event)

      if (!response) return next(new NotFound(`Could not find ${event}`))
    } catch (err) {
      return next(err)
    }

    return res.status(204).end()
  },
})
