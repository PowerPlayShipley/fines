/**
 * Load the clients, handle any errors inside this so
 * we can keep `service.js` cleaner and divide the code
 * out to more maintainable chunks.
 *
 * Should not be called during tests
 * */

const networking = require('@harrytwright/networking')

const event = require('../events')
const database = require('../database')

const log = require('../../utils/log')

const errorHandler = require('../../utils/error-handler')

const { safe_context } = database

module.exports = (config) => {
  /**
   * Connect to the database. Set its closure in place
   *
   * Or handle its connection error
   * */
  database.connect(config).then((database) => {
    log.notice('loader:database', safe_context(database.ctx), 'connected to database')
    networking.closure((done) => database.close(true, done))
  }).catch(errorHandler)

  /**
   * Connect to the event stream
   * */
  event.connect(config).then((event) => {
    log.notice('loader:event', { uri: event.uri }, 'connected to event stream')
    networking.closure((done) => { event.quit(); done() })
  }).catch(errorHandler)
}
