const queue = require("./queue")


module.exports = {
    info: (vo, log, extra) => {
        const uuid = vo.uuid ? vo.uuid : vo
        const level = `[${vo.level || 0}]`
        let executionTime
        
        try {
            executionTime = (new Date().getTime() - vo.startTime.getTime()) + 'ms'
            if (extra) {
                console.log(uuid, level, executionTime, log, extra)    
            } else {
                console.log(uuid, level, executionTime, log)
            }            
        } catch (error) {
            if (extra) {
                console.log(uuid, level, log, extra)    
            } else {
                console.log(uuid, level, log)
            }
        }

        try {
            queue.sendToQueue("LOG", { startTime: vo.startTime, log, extra, executionTime, level, uuid, url: vo.url })    
        } catch (error) {
            console.error('Error on send log to producer', error)
        }
    }
}