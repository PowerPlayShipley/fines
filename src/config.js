const buildDate = new Date()

const Config = require('@harrytwright/cli-config')

const { version, name } = require('../package.json')

/**
 * Any important values from `process.env` related to itself
 *
 * Mainly for the production or testing
 * */
const environment = { }

const NODE_ENV = process.env.NODE_ENV || 'development'
const isProduction = (NODE_ENV === 'production')

/* istanbul ignore next */
const isTest = NODE_ENV === 'test' ||
  NODE_ENV === 'testing'

environment['node-env'] = NODE_ENV
environment.production = isProduction
environment.test = isTest

const defaults = {
  ...environment,
  cors: '*',
  date: buildDate,
  'database-collection': 'conf',
  'database-uri': 'localhost:27017',
  loglevel: 'info',
  name,
  proxy: true,
  port: 3000,
  route: '/',
  version,
  zipkin: false
}

const types = {
  cors: String,
  date: [Date, String],
  'database-collection': String,
  'database-uri': String,
  loglevel: [
    'silent',
    'error',
    'warn',
    'notice',
    'http',
    'timing',
    'info',
    'verbose',
    'silly'
  ],
  name: String,
  'node-env': [null, String],
  production: Boolean,
  proxy: Boolean,
  port: [Number, String],
  route: String,
  test: Boolean,
  version: String,
  zipkin: [String, Boolean]
}

const shorthand = {
  collection: ['--database-collection'],
  verbose: ['--loglevel', 'verbose']
}

// Automatically add the types to the envMap, since most of these will run inside docker
// will help set more values via `-e '...=...'` or docker-compose
const envFromTypes = Object.keys(types).reduce((curr, key) => ({
  ...curr, [key.replace(/-/, '_').toUpperCase()]: key
}), { })

const envMap = {
  ...envFromTypes,
  PORT: 'port'
}

module.exports = new Config({ defaults, types, shorthand, envMap })
