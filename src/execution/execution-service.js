const log = require('../logger/logger')
const Execution = require('./execution-model')
const scraper = require('./execution-scraper')
const producer = require('./execution-producer')
const commons = require('../utils/commons')

const startExecution = async (data) => {

    return scraper.execute(data)
        .then(applyFilter)
        .then(applyChangedUnique)
        .then(saveExecution)
        .then(notifyExecution)
        .then(createSubExecution)

}

const applyChangedUnique = async (execution) => Promise.all([
        applyChanged(execution),
        applyUnique(execution)
    ]).then(([hashTargetChanged, hashTargetUnique]) => {
        execution.hashTargetChanged = hashTargetChanged
        execution.hashTargetUnique = hashTargetUnique
        return execution
    })
    

const applyChanged = async (execution) => {
    log.info(execution, 'Calculation changed hash')

    const { hashTarget, monitoringId, level } = execution
    const lastExecution = await Execution.find({monitoringId, level}).sort({_id: -1}).limit(1).lean()

    let hashTargetChanged = lastExecution.length > 0 ? lastExecution[0].hashTarget != hashTarget : false

    log.info(execution, `Changed hash calculated, hashTargetChanged=${hashTargetChanged}`)
    return hashTargetChanged
}

const applyUnique = async (execution) => {
    log.info(execution, 'Calculation unique hash')

    const { hashTarget } = execution
    const findedExecution = await Execution.findOne({ hashTarget }).lean()

    const hashTargetUnique = !findedExecution

    log.info(execution, `Changed unique calculated, hashTargetUnique=${hashTargetUnique}`)
    return hashTargetUnique
}

const saveExecution = async (execution) => {
    log.info(execution, 'Save execution')

    delete execution._id
    const newExecution = new Execution(execution)

    try {
        await newExecution.save()
        log.info(execution, 'Execution saved')
    } catch (err) {
        log.info(execution, 'Error on save execution', err)
    }

    return newExecution.toJSON()
}

const createSubExecution = (execution) => {
    if (execution.level >= process.env.EXECUTION_LEVEL_LIMIT) {
        log.info(execution, 'Sub Execution limit reached')
        return execution
    }    

    
    (execution.extractedContent || [])
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
        ...execution,
        url: content,
        level: execution.level + 1        
    }
}

const notifyExecution = async (execution) => {    
    producer.postNotifyComplete({ 
        id: execution._id,
        uuid: execution.uuid, 
        level: execution.level,
        monitoringId: execution.monitoringId
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
    if (!commons.hasSimilarity(execution.uuid, extractedTarget, words, threshold)) {
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