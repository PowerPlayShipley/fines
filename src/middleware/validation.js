const { BadRequest, UnprocessableEntity } = require('@hndlr/errors')
const validation = require('../utils/validation/index')

/**
 * @param {("season"|"event")} type
 * */
module.exports.post = (type) => (req, res, next) => {
  const body = req.body

  // Maybe, or maybe we can create an empty config first during an on-boarding
  if (!body || Object.keys(body).length === 0) {
    return next(new BadRequest('Missing POST body'))
  }

  try {
    validation.validate(type, body)
    next()
  } catch (err) {
    // TODO: Better underlying errors
    return next(new UnprocessableEntity('Invalid Body', err))
  }
}

module.exports.patch = (req, res, next) => {
  const body = req.body

  // Maybe, or maybe we can create an empty config first during an on-boarding
  if (!body || Object.keys(body).length === 0) {
    return next(new BadRequest('Missing POST body'))
  }

  try {
    validation.validatePatch(Array.isArray(body) ? body : [body])
    next()
  } catch (err) {
    // TODO: Better underlying errors
    return next(new UnprocessableEntity('Invalid Body', err))
  }
}
