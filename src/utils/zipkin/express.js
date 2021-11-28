const { nanoid } = require('nanoid')
const tracer = require('cls-rtracer')

const idFactory = () => nanoid()

module.exports = tracer.expressMiddleware({
  useHeader: true,
  headerName: 'X-SESSION-TOKEN',
  requestIdFactory: idFactory
})
