const log = require('../log')

class ZipkinLogger {
  constructor () {
    this.logger = log.timing
  }

  logSpan (span) {
    // Maybe change this so the namespace is something related to to the remote service
    this.logger('zipkin', { ...span, trace: span.id }, span.name)
  }
}

module.exports = ZipkinLogger
