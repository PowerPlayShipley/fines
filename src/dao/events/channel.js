// const { EventEmitter } = require('events')

const log = require('../../utils/log')

class Channel {

  static async create (connection, exchange, queue = '', type = 'direct', opts = { durable: true }) {
    return (new Channel(connection, exchange, queue, type, opts)).#create()
  }

  constructor(connection, exchange, queue, type, opts) {
    /** @typedef {amqp.Connection} */
    this.connection = connection

    /** @typedef {string} */
    this.exchange = exchange

    /** @typedef {string} */
    this.type = type

    /** @typedef {Object} */
    this.opts = opts

    /** @typedef {amqp.Channel} */
    this.channel = void 0;

    /** @typedef {amqp.Queue} */
    this.queue = void 0;

    this.queueName = queue
  }

  async #create() {
    this.channel = await this.connection.connection.createChannel()
    this.channel.assertExchange(this.exchange, this.type, this.opts)
    return this
  }

  emit(eventName, message) {
    log.info('event:stream', { eventName, message }, 'Published %s', JSON.stringify(message))
    this.channel.publish(this.exchange, eventName, Buffer.from(JSON.stringify(message)))
  }

  on(eventName, listener, opts = { exclusive: false, durable: true }) {
    const self = this
    eventName = Array.isArray(eventName) ? eventName : [eventName]

    this.channel.assertQueue(this.queueName, opts).then(queue => {
      self.queue = queue

      log.notice('event:on', { eventName, queue: queue.queue }, 'Listening to events %s', eventName)

      eventName.forEach(event => {
        self.channel.bindQueue(queue.queue, self.exchange, event)
      })

      self.channel.consume(queue.queue, listener, { noAck: false })
    })
  }

  acknowledge(msg) {
    return this.channel.ack(msg)
  }

}

module.exports = { Channel }
