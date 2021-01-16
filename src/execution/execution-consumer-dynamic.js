const { consumeFromQueue } = require("../utils/queue")

const onExecutionResponse = (data, callback) => consumeFromQueue(`EXECUTION_RESPONSE_${data.uuid}`, callback, 1, true)

module.exports = {
    onExecutionResponse
}