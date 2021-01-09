const queue = require("../utils/queue")

const postNotifyComplete = (data) => queue.sendToQueue("EXECUTION_COMPLETED", data)

const postSubExecution = (data) => queue.sendToQueue("EXECUTION_SEQUENCIAL", data)

const postSubExecutionDLQ = (data) => (error) => queue.sendToQueue("EXECUTION_SEQUENCIAL_DLQ", { data, error })

const postExecution = (data) => queue.sendToQueue("EXECUTION_INCOMING", data)

const postExecutionDLQ = (data) => (error) => {
    console.error(error)
    queue.sendToQueue("EXECUTION_INCOMING_DLQ", { data, error })
}

module.exports = {
    postNotifyComplete,
    postSubExecution,
    postSubExecutionDLQ,
    postExecution,
    postExecutionDLQ
}