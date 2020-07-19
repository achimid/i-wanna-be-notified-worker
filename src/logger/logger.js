const queue = require('../utils/queue')
const ExecutionLog = require('./log-model')

let buffer = []

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
        buffer.push({uuid, executionTime, log, extra})        
    }
}

setInterval(() => {
    if (buffer.length == 0) return

    const insertList = [...buffer]
    buffer = []

    ExecutionLog.insertMany(insertList).then(() => console.log(`${insertList.length} Logs saved`))
}, 20000)