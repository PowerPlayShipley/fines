const os = require('os')

const {
  Tracer,
  BatchRecorder,
  jsonEncoder: { JSON_V2 }
} = require('zipkin')

const CLSContext = require('zipkin-context-cls')
const { HttpLogger } = require('zipkin-transport-http')

const log = require('../log')
const ZipkinLogger = require('./logger')

const initialised = Symbol('initialised')

let tracer

class Zipkin {
  get tracer () {
    if (!tracer) {
      tracer = new Tracer({
        recorder: this.recorder,
        ctxImpl: new CLSContext('geolocation', true),
        localServiceName: this.localService,
        defaultTags: {
          // This is for when running multiple-instances
          hostname: os.hostname()
        }
      })
    }

    return tracer
  }

  /**
   * @param {Config} config
   * @param {Object} logger - This is purely for testing, so we can initialise this and test
   * */
  initialise (config, logger) {
    this.localService = config.get('name')

    const zipkin = config.get('zipkin')

    if (!zipkin) {
      log.warn('zipkin', {}, 'Zipkin will not be initialised')
      log.warn('zipkin', {}, 'If you wish to use zipkin run with --zipkin')
      log.warn('zipkin', {}, `Or use '${this.localService}:zipkin'`)
      return // Just exit here
    }

    this.recorder = (typeof zipkin === 'string' || !!logger) ? new BatchRecorder({
      logger: logger || new HttpLogger({
        endpoint: `${zipkin}/api/v2/spans`,
        jsonEncoder: JSON_V2, // JSON encoder to use. Optional (defaults to JSON_V1)
        httpInterval: 1000,
        timeout: 1000,
        agent: new (require('http').Agent)({ keepAlive: true })
      })
    }) : new BatchRecorder({ logger: new ZipkinLogger() })

    this[initialised] = true
  }

  /**
   * Create and run an express middleware adding tracing
   *
   * If zipkin is not initialised, or set to --no-zipkin, it will use `cls-rtracer'` so we can still get a valid trace
   * */
  express ({ port = 3000 }) {
    if (!this[initialised]) return require('./express')
    return require('zipkin-instrumentation-express').expressMiddleware({ tracer: this.tracer, port })
  }

  // Allow for extra customisation here
  monk ({ remoteServiceName = 'mongodb', verbose = true }) {
    if (!this[initialised]) throw new TypeError('Called monk before initialised')
    return require('monk-middleware-zipkin-instrumentation')({ tracer: this.tracer, remoteServiceName, verbose })
  }
}

module.exports = new Zipkin()
