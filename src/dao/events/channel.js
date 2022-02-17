// const { EventEmitter } = require('events')

const log = require('../../utils/log')

class Channel {

  static async create (connection, exchange, queue = '', type = 'direct', opts = { durable: true }) {
    return (new Channel(connection, exchange, queue, type, opts)).#create()
  }

  constructor(connection, exchange, queue, type, opts) {
    /** @typedef {EventStream} */
    this.connection = connection

    /** @typedef {string} */
    this.exchange = exchange

    /** @typedef {string} */
    this.type = type

    /** @typedef {Object} */
    this.opts = opts

    /** @typedef {module:amqplib.Channel} */
    this.channel = void 0;

    /** @typedef {Object} */
    this.queue = void 0;

    this.queueName = queue
  }

  async #create() {
    this.channel = await this.connection.connection.createChannel()
    this.channel.assertExchange(this.exchange, this.type, this.opts)
    return this
  }

  emit(eventName, ...message) {
    log.info('event:stream', { eventName, message }, 'Published %s', createMessage(message))
    this.channel.publish(this.exchange, eventName, Buffer.from(createMessage(message)))
  }

  on(eventName, listener, opts = { exclusive: false, durable: true }) {
    const self = this
    eventName = Array.isArray(eventName) ? eventName : [eventName]

    this.channel.assertQueue(this.queueName, opts).then(queue => {
      self.queue = queue
      return queue
    }).then(queue => {
      log.info('event:on', { queue: queue.queue }, 'Created queue %s', queue.queue)
      return Promise.allSettled(eventName.map((event) => self.channel.bindQueue(queue.queue, self.exchange, event)))
    }).then((_) => {
      log.info('event:on', { eventName, queue: self.queue.queue }, 'Listening to events %s', eventName)
      self.channel.consume(self.queue.queue, listener, { noAck: false })
    })
  }

  acknowledge(msg) {
    return this.channel.ack(msg)
  }

}

module.exports = { Channel }

function createMessage (messages) {
  if (messages.length === 1) return JSON.stringify(messages[0])
  return JSON.stringify(messages)
}
