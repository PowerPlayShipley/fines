module.exports = (router) => {
  require('./routes/internal')(router)
  require('./routes/leagues')(router)
  require('./routes/seasons')(router)
}
