const tracer = require('cls-rtracer')

module.exports = (zipkin) => (req, res, next) => {
  if (!zipkin) {
    req.id = tracer.id()
  } else {
    req.id = req._trace_id.traceId
  }

  return next()
}
