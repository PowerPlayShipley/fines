const config = require('../../config')

const os = require('../../utils/os')
const build = require('../../utils/build')

module.exports = Object.assign({}, {
  home: (req, res, next) => {
    return res.status(200).json({
      meta: {
        status: 200,
        requestId: req.id
      },
      name: config.get('name'),
      version: config.get('version'),
      os,
      build
    })
  },
  healthcheck: (req, res, next) => {
    res.set('Content-Type', 'text/plain')
    return res.status(200).send('healthy').end()
  }
})
