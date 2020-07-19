const queue = require('../utils/queue')
const ExecutionLog = require('./log-model')

let buffer = []

module.exports = {
    info: (vo, log, extra) => {
        const uuid = vo.uuid
        let executionTime
        try {
            executionTime = (new Date().getTime() - vo.startTime.getTime()) + 'ms'
            if (extra) console.log(uuid, executionTime, log, extra)    
            console.log(uuid, executionTime, log)
        } catch (error) {
            console.log(...arguments)
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