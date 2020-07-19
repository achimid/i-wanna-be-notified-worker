let conn = null

function createConnection() {
	return require('amqplib').connect(process.env.RABBITMQ_CONNECTION).then(conn => conn.createChannel())
}

function connect() {
	if (!conn) conn = createConnection()	
	return conn
}

function createQueue(channel, queue) {
	return new Promise((resolve, reject) => {
		try {
			channel.assertQueue(queue, { durable: true })
			resolve(channel)
		}
		catch (err) { reject(err) }
	})
}

const sendToQueue = (queue, message) => 
	connect()
		.then(channel => createQueue(channel, queue))
		.then(channel => channel.sendToQueue(queue, Buffer.from(JSON.stringify(message))))


const consumeFromQueue = (queue, callback) => {
	connect()
		.then(channel => createQueue(channel, queue))
		.then(channel => channel.consume(queue, callback, { noAck: true }))
		.catch(err => console.log(err))
}

const consumeFromQueueWithAck = (queue, callback, prefetch) => {
	connect()
		.then(channel => createQueue(channel, queue))
		.then(channel => {
			if (prefetch) channel.prefetch(prefetch)
			channel.consume(queue, (msg) => { callback(msg, () => channel.ack(msg)) }, { noAck: false })
		})
		.catch(err => console.log(err))
}

module.exports = {
	sendToQueue,
	consumeFromQueue,
	consumeFromQueueWithAck
}