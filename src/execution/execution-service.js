const log = require('../logger/logger')
const Execution = require('./execution-model')
const crawler = require('./execution-crawler')
const producer = require('./execution-producer')
const commons = require('../utils/commons')

const { onExecutionResponse } = require('./execution-consumer-dynamic')

const consumeIncoming = (data) => startExecution(data).then(executionContextManager)

const consumeExecution = (data) => startExecution(data)

const startExecution = async (execution) => {
    const cache = await getCache(execution)
    if (cache) return cache

    return crawler.execute(execution)
        .then(applyFilter)
        .then(applyChangedUnique)
        .then(saveExecution)
        .then(notifyExecutionCompleted)
        .then(notifyExecutionResponse)
}

const getCache = async ({ url, scriptTarget, scriptNavigate }) => {
    const dataMatch = { url, scriptTarget, scriptNavigate, isSuccess: true, 
        createdAt: { $lt: new Date(Date.now() - 10 * 60 * 1000) } } // 10 Minutes
    const cache = await Execution.findOneLean(dataMatch)
    return cache
}

const executionContextManager = (execution) => {

    const ctx = {
        counter: 0,
        urlToExecute: new Array(...(execution.extractedNavigate || [])),
        urlExecuted: new Set(),
        urlExecuting: new Set()
    }

    onExecutionResponse(execution, (vo) => {
        log.info(vo, `Execution completed and received with success [${vo.url}]`)
        
        const urlExtracted = vo.extractedNavigate
        const url = vo.url        
        
        ctx.urlExecuted.add(url)
        ctx.urlExecuting.delete(url)
        urlExtracted.map(v => ctx.urlToExecute.push(v))
        
        ctx.urlToExecute = [...new Set(ctx.urlToExecute)]

        console.log(`Extracted: [${urlExtracted.length}]`)
        console.log(`To Execute: [${ctx.urlToExecute.length}]`)
        console.log(`Executiong: [${ctx.urlExecuting.size}]`)
        console.log(`Executed: [${ctx.urlExecuted.size}]`)
        console.log('------------------------')  

        processExecutionList(ctx, execution)
    })
   
    processExecutionList(ctx, execution)    
}

const processExecutionList = (ctx, execution) => {
    log.info(execution, `Starting process check`)

    const reachLimit = (value) => value >= (execution.options.levelMax || 5)

    while (ctx.urlToExecute.length > 0 && !reachLimit(ctx.counter)) {
        const url = ctx.urlToExecute.shift()

        if (ctx.urlExecuted.has(url) || ctx.urlExecuting.has(url)) {
            log.info(execution, `Ignoring url repeated [${url}] `)
            continue
        }

        ctx.urlExecuting.add(url)
        ctx.counter = ctx.counter + 1 

        const data = {...execution, url, level: ctx.counter}

        if (reachLimit(ctx.counter)) data.isLast = true

        log.info(execution, `Sending execution to parallel process [${url}] `)
        producer.postExecution(data)        
    }
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

    const { hashTarget, monitoringId, level, url } = execution
    
    let lastExecution = await Execution.many(Model => Model.find({monitoringId, level, url}).sort({_id: -1}).limit(1).lean())
    lastExecution = lastExecution.sort((a,b) => a._id.toString() < b._id.toString())

    let hashTargetChanged = lastExecution.length > 0 ? lastExecution[0].hashTarget != hashTarget : false

    log.info(execution, `Changed hash calculated, hashTargetChanged=${hashTargetChanged}`)
    return hashTargetChanged
}

const applyUnique = async (execution) => {
    log.info(execution, 'Calculation unique hash')

    const { hashTarget } = execution
    const findedExecution = await Execution.findOneLean({ hashTarget })

    const hashTargetUnique = !findedExecution

    log.info(execution, `Changed unique calculated, hashTargetUnique=${hashTargetUnique}`)
    return hashTargetUnique
}

const saveExecution = async (execution) => {
    log.info(execution, 'Save execution')

    delete execution._id
    const newExecution = Execution.get(execution)

    try {
        await newExecution.save()
        log.info(execution, 'Execution saved')
    } catch (err) {
        log.info(execution, 'Error on save execution', err)
    }

    return newExecution.toJSON()
}

const createSubExecution = async (execution) => {
    if (execution.level >= process.env.EXECUTION_LEVEL_LIMIT) {
        log.info(execution, 'Sub Execution limit reached')        
        return execution
    }
    

    if (execution.options.levelMax && execution.level >= execution.options.levelMax) {        
        log.info(execution, 'Sub Execution limit reached')
        return execution
    }

    const linksFromExtractedContent = getLinksFromExtractedContent(execution)

    if (!linksFromExtractedContent || linksFromExtractedContent.length == 0) {
        return execution
    } else {
        linksFromExtractedContent
            .map(mapNewSubExecution(execution))
            .map(postSubExecution)
    }

    return execution
}

const getLinksFromExtractedContent = (execution) => {
    return (execution.extractedContent || [])
        .filter(v => v)
        .filter(commons.isURL)
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


const notifyExecutionResponse = async (execution) => {
    producer.postExecutionResponse(execution)
    return execution
}

const notifyExecutionCompleted = async (execution) => {    
    producer.postExecutionCompleted({ 
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
    consumeIncoming,
    consumeExecution
}