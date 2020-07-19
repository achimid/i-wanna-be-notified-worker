console.log("worker started");

const queue = require("./src/utils/queue");
queue.consumeFromQueue("test", message => {
    console.log("processing 01 " + message.content.toString());
})

queue.consumeFromQueue("test", message => {
    console.log("processing 02 " + message.content.toString());
})

console.log('end')