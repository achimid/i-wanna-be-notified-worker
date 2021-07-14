const queue = require("../utils/queue")


const send = (data) => queue.sendToQueue("LOG", data)

module.exports = {
    send
}