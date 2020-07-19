const queue = require("../utils/queue")

const notifyComplete = (data) => queue.sendToQueue("EXECUTION_COMPLETED", data)

module.exports = {
    notifyComplete
}