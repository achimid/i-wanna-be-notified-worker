module.exports = {
    info: (vo, log, extra) => {
        try {
            const executionTime = (new Date().getTime() - vo.startTime.getTime())            
            if (extra) console.log(vo.uuid, `${executionTime}ms`, log, extra)    
            console.log(vo.uuid, `${executionTime}ms`, log)    
        } catch (error) {
            if (extra) console.log(vo, log, extra)
            console.log(vo, log)
        }
        
    }
}