const queue = require("../utils/queue")
const { execute } = require('./execution-scraper')

module.exports = () => {
    console.info('Inicializando execution consumer')
    
    queue.consumeFromQueueWithAck("EXECUTION_INCOMING", (message, ack) => {
        const data = JSON.parse(message.content.toString())
        execute(data).then(ack)
    }, parseInt(process.env.CONCURENT_EXECUTIONS))

}
