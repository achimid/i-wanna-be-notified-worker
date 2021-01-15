const fetch = require('node-fetch')

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

function createQueueAutoDelete(channel, queue) {
	return new Promise((resolve, reject) => {
		try {
			channel.assertQueue(queue, {durable: true})
			resolve(channel)
		}
		catch (err) { reject(err) }
	})
}

const sendToQueue = (queue, message) => 
	connect()
		.then(channel => createQueue(channel, queue))
		.then(channel => channel.sendToQueue(queue, Buffer.from(JSON.stringify(message))))


let last
const manuallyDeleteQueue = (queue) => {
	if (last) clearTimeout(last)
	last = setTimeout(()=> {
		fetch(`${process.env.RABBITMQ_CONNECTION_API}/api/queues/%2F/${queue}`, { 
			method: 'DELETE',
			body: JSON.stringify({
				vhost: "%2F",
				name: queue,
				mode: "DELETE"
			})
		}).then(() => console.log(`Queue Removed [${queue}]`))
	}, 60 * 100 * 1) // 1 Minute
}

// const consumeFromQueue = (queue, callback) => {
// 	connect()
// 		.then(channel => createQueue(channel, queue))
// 		.then(channel => channel.consume(queue, callback, { noAck: true }))
// 		.catch(err => console.log(err))
// }

const consumeFromQueueWithAck = (queue, callback, prefetch) => {
	connect()
		.then(channel => createQueue(channel, queue))
		.then(channel => {
			if (prefetch) channel.prefetch(prefetch)
			channel.consume(queue, (msg) => { callback(msg, () => channel.ack(msg)) }, { noAck: false })
		})
		.catch(err => console.log(err))
}

const consumeFromQueueAutoDelete = (queue, callback, prefetch) => {
	connect()
		.then(channel => createQueueAutoDelete(channel, queue))
		.then(channel => {
			if (prefetch) channel.prefetch(prefetch)
			channel.consume(queue, (msg) => { 
				if (msg) {
					callback(msg, () => channel.ack(msg))	
					manuallyDeleteQueue(queue)
				} 
			}, { noAck: false })
		})
		.catch(err => console.log(err))
}


const consumeFromQueue = (queueName, callbackPromise, prefetch, autoDelete) => {
	
	const consumerStrategy = autoDelete ? consumeFromQueueAutoDelete : consumeFromQueueWithAck
    const logError = (error) => console.log(`Error on consume message from queue [${queueName}]: `, error)
    const sendToDLQ = ({message, stack}, data) => sendToQueue(`${queueName}_DLQ`, { error: {message, stack}, data })
    const errorOnConsume = (data) => (error) => {
        logError(error)
        sendToDLQ(error, data)
	}
		

    consumerStrategy(queueName, (message, ack) => {
		if (autoDelete) {
        	try {
				const data = JSON.parse(message.content.toString())
				callbackPromise(data)
			} catch (error) {
				errorOnConsume(message)(error)
			} finally {
				ack()
			}
		} else {
			try {
				const data = JSON.parse(message.content.toString())
				callbackPromise(data)
					.catch(errorOnConsume(data))
					.finally(ack)
			} catch (error) {
				errorOnConsume(message)(error)
				ack()
			}			
		}
    }, prefetch)

}


module.exports = {
	sendToQueue,
	consumeFromQueue
}