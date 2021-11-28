'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const Ajv = require('ajv')

// ------------------------------------------------------------------------------
// Public Interface
// ------------------------------------------------------------------------------

module.exports = (additionalOptions = {}) => {
  const ajv = new Ajv({
    meta: false,
    useDefaults: true,
    validateSchema: true,
    verbose: true,
    ...additionalOptions
  })

  return ajv
}
