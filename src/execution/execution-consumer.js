const { consumeFromQueue } = require("../utils/queue")
const service = require('./execution-service')

const prefetchIncoming = parseInt(process.env.CONCURENT_INCOMINGS)
const prefetchExecution = parseInt(process.env.CONCURENT_EXECUTIONS)

const initConsumer = () => {
    
    consumeFromQueue("INCOMING", service.consumeIncoming, prefetchIncoming)
    consumeFromQueue("EXECUTION", service.consumeExecution, prefetchExecution)

}
module.exports = {
    initConsumer
}
