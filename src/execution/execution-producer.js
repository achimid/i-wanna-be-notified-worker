const queue = require("../utils/queue")

const postIncoming = (data) => queue.sendToQueue("INCOMING", data)

const postExecution = (data) => queue.sendToQueue("EXECUTION", data)

const postExecutionCompleted = (data) => queue.sendToQueue("EXECUTION_COMPLETED", data)

const postExecutionResponse = (data) => queue.sendToQueue(`EXECUTION_RESPONSE_${data.uuid}`, data)

module.exports = {
    postIncoming,
    postExecution,
    postExecutionResponse,
    postExecutionCompleted
}