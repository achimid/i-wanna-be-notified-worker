const log = require('../logger/logger')
const Execution = require('./execution-model')
const scraper = require('./execution-scraper')
const producer = require('./execution-producer')

const startExecution = async (data) => {

    return scraper.execute(data)
        .then(saveExecution)
        .then(notifyExecution)
        .then(createSubExecution)

}

const saveExecution = async (execution) => {
    return new Execution(execution).save()
}

const createSubExecution = (execution) => {
    if (execution.level >= process.env.EXECUTION_LEVEL_LIMIT) {
        log.info(execution, 'Sub Execution limit reached')
        return execution
    }    

    log.info(execution, 'Creating new subExecution')
    execution.extractedContent
        .filter(v => v)
        .filter(isURL)
        .map(content => {
            return {
                url: content,
                scriptTarget: execution.scriptTarget,
                scriptContent: execution.scriptContent,
                level: (execution.level || 0) + 1,
                options: execution.options,
                uuid: execution.uuid
            }
        }).map(producer.postSubExecution)

    return execution
}

const notifyExecution = async (execution) => {    
    producer.postNotifyComplete({ 
        uuid: execution.uuid, 
        id: execution.id 
    })
    return execution
}

const isURL = (str) => {
    const urlRegex = '^(?:(?:http|https)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
    const url = new RegExp(urlRegex, 'i');
    return (str.length < 2083 && url.test(str));
}

module.exports = {
    startExecution
}