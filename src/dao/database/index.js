const URL = require('url').URL

const monk = require('monk')

const log = require('../../utils/log')
const config = require('../../config')
const promiseOrCallback = require('../utils/promiseOrCallback')

const _client = Symbol('database:client')

/**
 * Database handler
 *
 * This will just do the routing and any changes to the
 * data we need
 * */
function Database () {
  this.ctx = undefined
  /** @type module::monk.IMonkManager */
  this[_client] = undefined
}

/* istanbul ignore next */
Database.prototype.status = function () {
  return this[_client] ? this[_client]._state : 'uninitialised'
}

Database.prototype.find = function (collection) {
  return function (lookup, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = null
    }

    return promiseOrCallback(callback, (cb) => {
      return this[_client].get(collection).find(lookup, options, cb)
    })
  }.bind(this)
}

Database.prototype.delete = function (collection) {
  return function (id, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = null
    }

    return promiseOrCallback(callback, (cb) => {
      return this[_client].get(collection).findOneAndDelete(id, options, cb)
    })
  }.bind(this)
}

Database.prototype.insert = function (collection) {
  return function (data, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = null
    }

    return promiseOrCallback(callback, (cb) => {
      return this[_client].get(collection).insert(data, options, cb)
    })
  }.bind(this)
}

Database.prototype.findOneWithId = function (collection) {
  return function (id, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = null
    }

    return promiseOrCallback(callback, (cb) => {
      return this[_client].get(collection).findOne(id, options, cb)
    })
  }.bind(this)
}

Database.prototype.findOneAndUpdateWithId = function (collection) {
  return function (id, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = null
    }

    return promiseOrCallback(callback, (cb) => {
      return this[_client].get(collection).findOneAndUpdate(id, options, cb)
    })
  }.bind(this)
}

/**
 * Connect the mongo client to its required server
 *
 * If no callback is supplied a promise is returned
 *
 * @param {Config} options
 * @param {Function} [callback]
 * @returns [Promise]
 * */
Database.prototype.connect = function (options = config, callback) {
  const ctx = createMongoContext(options)

  // Just in-case in the future it's needed
  this.ctx = ctx

  const self = this
  return promiseOrCallback(callback, (cb) => {
    monk(ctx.uri, ctx.options, async (err, client) => {
      if (err) return cb(err, self)

      self[_client] = client

      try {
        self[_client].addMiddleware(require('../../utils/zipkin').monk({
          verbose: true
        }))
      } catch (err) {
        log.notice('monk', { }, 'zipkin middleware not initialised')
      }

      cb(null, self)
    })
  })
}

/**
 * Close the sever
 *
 * Ignore params as this just pipes straight into
 * the `MongoClient.close` method
 * */
Database.prototype.close = function (force, callback) {
  // Maybe?? Don't quote lmao
  // TODO: Test this
  if (!this[_client]) return [...arguments].pop()()
  this[_client].close(...arguments)
}

/**
 * In theory should never need to be ran as the collection
 * should already have data in place, but need to figure
 * this out when I can handle the CPU better for the cron
 * job. Will be more helpful for testing
 *
 * @private
 * */
Database.prototype._initialise = async function (ctx) {
  log.verbose('database.initialisation', safe_context({ ...ctx }), 'initialising the collection [%s]', ctx.collection)
}

module.exports = new Database()
module.exports.safe_context = safe_context

/**
 * Turn out config to the one monk will see
 * */
function createMongoContext (config) {
  const uri = new URL(`mongodb://${config.get('database-uri')}`)
  if (config.get('database-password') || config.get('database-username')) {
    uri.password = config.get('database-password')
    uri.username = config.get('database-username')
  }

  let authSource
  if (config.get('auth-database')) {
    authSource = config.get('auth-database')
  }

  return {
    uri: uri.href,
    options: {
      appname: config.get('name'),
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource
    }
  }
}

/**
 * Hide the the password/username for logging
 * */
function safe_context (ctx) {
  const mut = { ...ctx }
  if ('uri' in mut) {
    const uri = new URL(mut.uri)
    uri.username = 'redacted'
    uri.password = 'redacted'
    mut.uri = uri.href
  }
  return mut
}
