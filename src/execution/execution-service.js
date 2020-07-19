const log = require('../logger/logger')
const Execution = require('./execution-model')
const scraper = require('./execution-scraper')
const producer = require('./execution-producer')
const commons = require('../utils/commons')

const startExecution = async (data) => {

    return scraper.execute(data)
        .then(applyFilter)
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

    
    execution.extractedContent
        .filter(v => v)
        .filter(commons.isURL)
        .map(mapNewSubExecution(execution))
        .map(postSubExecution)

    return execution
}

const postSubExecution = (execution) => {
    log.info(execution, 'Creating new subExecution')
    producer.postSubExecution(execution)
}

const mapNewSubExecution = (execution) => (content) => {
    return {
        url: content,
        scriptTarget: execution.scriptTarget,
        scriptContent: execution.scriptContent,
        level: (execution.level || 0) + 1,
        options: execution.options,
        uuid: execution.uuid
    }
}

const notifyExecution = async (execution) => {    
    producer.postNotifyComplete({ 
        uuid: execution.uuid, 
        id: execution.id 
    })
    return execution
}

const applyFilter = (execution) => {
    const { filter, extractedTarget } = execution

    if (!filter || !filter.words.length) {
        log.info(execution, 'Filter not applyed')
        return execution
    }
    
    let filterMatch
    const { words, threshold} = filter
    if (!commons.hasSimilarity(extractedTarget, words, threshold)) {
        filterMatch = false
        log.info(execution, `No similarity found, filter not match [${words}]`)
    } else {
        filterMatch = true
        log.info(execution, `Similarity found, filter match [${words}]`)
    }

    return {...execution, filterMatch}    
}



module.exports = {
    startExecution
}