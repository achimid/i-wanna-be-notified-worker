const fetch = require('node-fetch')

let conn = null

const authRabbitMQ = Buffer.from(process.env.RABBITMQ_CONNECTION_USER + ':' + process.env.RABBITMQ_CONNECTION_PASSWORD).toString('base64')
const urlRabbotMQ = process.env.RABBITMQ_CONNECTION_API

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


let queuePool = {}
const manuallyDeleteQueue = (queue) => {
	if (queuePool[queue]) clearTimeout(queuePool[queue])
	queuePool[queue] = setTimeout(() => {
		removeQueue(queue)
		delete queuePool[queue]
	}, 60 * 100 * 1) // 1 Minute	
}

const removeQueue = (queue) => {
	fetch(`${urlRabbotMQ}/api/queues/%2F/${queue}`, { 
			method: 'DELETE',
			headers: { 'Authorization': 'Basic ' + authRabbitMQ },
			body: JSON.stringify({
				vhost: "%2F",
				name: queue,
				mode: "DELETE"
			})
		})
		.then(() => console.log(`Queue removed [${queue}]`))
		.catch(() => console.log(`Queue not removed [${queue}]`))
}

const removeQueueByExecution = ({ uuid }) => removeQueue(`EXECUTION_RESPONSE_${uuid}`)

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
		var transaction = newrelic.getTransaction()
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
	consumeFromQueue,
	removeQueueByExecution
}