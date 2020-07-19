const queue = require("../utils/queue")
const service = require('./execution-service')

module.exports = () => {
    console.info('Inicializando execution consumer')
    
    queue.consumeFromQueueWithAck("EXECUTION_INCOMING", (message, ack) => {
        const data = JSON.parse(message.content.toString())
        service.startExecution(data).then(ack)
    }, parseInt(process.env.CONCURENT_QUEUE_EXECUTIONS))


    queue.consumeFromQueueWithAck("EXECUTION_SEQUENCIAL", (message, ack) => {
        const data = JSON.parse(message.content.toString())
        service.startExecution(data).then(ack)
    }, parseInt(process.env.CONCURENT_QUEUE_SUB_EXECUTIONS))

}
