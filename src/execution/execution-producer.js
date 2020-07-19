const queue = require("../utils/queue")

const postNotifyComplete = (data) => queue.sendToQueue("EXECUTION_COMPLETED", data)

const postSubExecution = (data) => queue.sendToQueue("EXECUTION_SEQUENCIAL", data)

const postExecution = (data) => queue.sendToQueue("EXECUTION_INCOMING", data)

module.exports = {
    postNotifyComplete,
    postSubExecution,
    postExecution
}