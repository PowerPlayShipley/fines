const amqp = require('amqplib/channel_api');

const { Channel } = require('./channel')

const log = require('../../utils/log')
const config = require('../../config')

const STATE = {
  initialised: 0x00,
  connected: 0x01
}

function EventStream () {
  this.channels = []
  this.connection = void 0
  this.state = STATE.initialised
}

/**
 * Connect to the event stream
 * @param {Config} options
 * @return Promise<EventStream>
 * */
EventStream.prototype.connect = async function (options = config) {
  this.uri = options.get('amqp')
  this.options = options
  this.connection = await amqp.connect(this.uri)
  this.state = STATE.connected
  return this
}

// There could be a better way to do this ?? probably with injection or something where @Stream('exchange') creates one
/**
 * @returns Promise<Channel>
 * */
EventStream.prototype.channel = async function () {
  let channel = this.channels.shift()
  if (!channel) {
    channel = await Channel.create(this, this.options.get('exchange'), this.options.get('queue'))
    this.channels.push(channel)
  }
  return channel
}

/**
 * Close connection to the stream
 * */
EventStream.prototype.quit = function () {
  log.notice('event', { uri: this.uri }, 'Goodbye uwu')
  return this.connection.close()
}

module.exports = new EventStream()
module.exports.STATE = STATE
