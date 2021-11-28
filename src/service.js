module.exports = () => {
  // Load any .env files
  require('./env')

  // This is needed loading of the config
  const { name, version } = require('../package.json')
  process.title = name

  // Get the logger and pause it for now
  const log = require('./utils/log')
  log.pause()

  // Log some very basic info
  log.verbose('cli', { agv: safe_args(process.argv) }, safe_args(process.argv))
  log.info('using', '%s@%s', name, version)
  log.info('using', 'node@%s', process.version)

  // Should close on these
  //
  // needs to be in this order before the
  // config so it can catch if config fails
  const errorHandler = require('./utils/error-handler')

  process.on('uncaughtException', errorHandler)
  process.on('unhandledRejection', errorHandler)

  // Load the configuration
  const config = require('./config')
  config.load()

  // Set up the logging and resume
  require('./utils/setup-log')(config)
  require('./utils/proc-log-listener')(config)
  log.resume()

  // Log out some standard details
  const os = require('./utils/os')
  const build = require('./utils/build')

  log.info('init', { port: config.get('port'), pid: process.pid }, '%s starting', name)
  log.info('init', { ...build }, 'build info')
  log.info('init', { ...os }, 'operating system')

  // Load the IP library
  require('./utils/zipkin').initialise(config)
  require('./dao/loader')(config)
  require('./utils/setup-validation')(config)

  // Start the server
  const networking = require('@harrytwright/networking')
  networking.listen(require('./app')(config), config.get('port')).then((server) => {
    log.notice('listen', 'Listening on ' + server.port)
  }).catch((error) => {
    log.error('listen', { ...error }, 'failed listen: %s', error.message)
    errorHandler(error)
  })
}

/**
 * Redact any important info i.e passwords from args for logging
 *
 * TODO: work on...
 *
 * @param {[string]} args
 * */
function safe_args (args) {
  const mut = [...args]
  for (let i = 0; i < mut.length; i++) {
    const key = mut[i]
    if (/(password|username)/.test(key) && !mut[i + 1].startsWith('--')) {
      mut[i + 1] = 'redacted'
    }
  }
  return mut
}
