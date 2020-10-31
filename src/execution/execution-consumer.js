const queue = require("../utils/queue")
const service = require('./execution-service')
const producer = require('./execution-producer')

const prefetchIncoming = parseInt(process.env.CONCURENT_QUEUE_EXECUTIONS)
const prefetchSequencial = parseInt(process.env.CONCURENT_QUEUE_SUB_EXECUTIONS)

module.exports = async () => {
    console.info('Starging execution consumer')
    
    const toData = (message) => JSON.parse(message.content.toString())

    const onConsumeIncoming = (message, ack) => {
        const data = toData(message)
        service.startExecution(data)
            .catch(producer.postExecutionDLQ(data))
            .finally(ack)
    }

    const onConsumeSequencial = (message, ack) => {
        const data = toData(message)
        service.startExecution(data)
            .catch(producer.postSubExecutionDLQ(data))
            .finally(ack)
    }

    queue.consumeFromQueueWithAck("EXECUTION_INCOMING", onConsumeIncoming, prefetchIncoming)

    queue.consumeFromQueueWithAck("EXECUTION_SEQUENCIAL", onConsumeSequencial, prefetchSequencial)

}
