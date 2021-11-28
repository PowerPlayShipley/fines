const cors = require('cors')
const helmet = require('helmet')
const express = require('express')
const erred = require('@hndlr/erred')
const bodyParser = require('body-parser')
const compression = require('compression')
const { NotFound } = require('@hndlr/errors')

const log = require('./utils/log')
const zipkin = require('./utils/zipkin')

/**
 * @param {Config} ctx
 * */
module.exports = (ctx) => {
  const app = express()

  app.use(zipkin.express({ port: ctx.get('port') }))
  app.set('trust proxy', !!ctx.get('proxy'))

  app.use(cors({
    origin: ctx.get('cors') || '*',
    methods: 'GET,HEAD',
    preflightContinue: false,
    optionsSuccessStatus: 204
  }))

  app.use(helmet())
  app.use(bodyParser.json())
  app.use(compression())

  app.use(require('./middleware/trace')(ctx.get('zipkin')))
  app.use(require('./middleware/morgan')(log))

  /**
   * Routing
   * */
  const router = express.Router()
  require('./api')(router)
  app.use(ctx.get('route') || '/', router)

  /**
   * Add error handling, we like to pass all errors back as a JSON
   * object since we're an API, the client should handle these
   * appropriately!
   */
  app.get('*', async (req, res, next) => {
    return next(new NotFound(`Could not find ${req.path}`))
  })

  app.use(erred({ stack: false }))

  return app
}
