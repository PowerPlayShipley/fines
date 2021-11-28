module.exports = (router) => {
  require('./routes/internal')(router)
  require('./routes/seasons')(router)
  require('./routes/events')(router)
}
