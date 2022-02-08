const amqp = require('amqplib')

module.exports = async (uri, exchange, queue = '', ...topics) => {
  const conn = await amqp.connect(uri)
  const channel = await conn.createChannel()

  await channel.assertExchange(exchange, 'direct', {
    durable: true
  });

  const q = await channel.assertQueue(queue, {
    exclusive: true
  })

  await Promise.allSettled(topics.map((topic) => channel.bindQueue(q.queue, exchange, topic)))

  return (consumer) => {
    channel.consume(q.queue, consumer, { noAck: true })

    return async () => {
      await conn.close()
    }
  }
}
