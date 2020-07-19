require('dotenv').config()

const queue = require("./src/utils/queue")

const data = {
    url: 'https://horriblesubs.info/',
    // scriptTarget: "$('.latest-releases li').first().find('a').children().not('strong').remove().end().end().text().trim()",
    scriptContent: [
        "$('.latest-releases li').first().find('a').children().not('strong').remove().end().end().text().trim()",
        "$($('.latest-releases li')[1]).find('a').children().not('strong').remove().end().end().text()",
        "$($('.latest-releases li')[2]).find('a').children().not('strong').remove().end().end().text()",
        "$($('.latest-releases li')[3]).find('a').children().not('strong').remove().end().end().text()",
        "$($('.latest-releases li')[4]).find('a').children().not('strong').remove().end().end().text()"
    ],
    options: {        
        useJquery: true
    }    
}


// setInterval(() => {
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
    queue.sendToQueue("EXECUTION_INCOMING", data)
// }, 10000)

