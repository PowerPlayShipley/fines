module.exports = (router) => {
  require('./routes/internal')(router)
  require('./routes/leagues')(router)
  require('./routes/events')(router)
}
