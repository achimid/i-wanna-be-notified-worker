const schedule = require('../utils/cron')
const SiteRequestModel = require('../site-request/sr-model')

const executionService = require('../site-execution/se-service')

const TelegramDispatcher = require('./telegram/telegram')
const EmailDispatcher = require('./email/email-dispatcher')
const WebHookDispatcher = require('./webhook/webhook-dispatcher')
const WebSocketDispacher = require('./websocket/websocket')

const { execute } = require('../site-execution/se-service')
const { templateFormat } = require('../utils/template-engine')
const { hasSimilarity } = require('../utils/text-search')
const { 
    hasUrlsOnContent, 
    getUrlsOnContent, 
    getFiltersFromSiteRequest 
} = require('../utils/commons')


const getNotifications = (site) => {
    if (site.notifications.length) return site.notifications
    if (site.userId && site.userId.notifications && site.userId.notifications.length) return site.userId.notifications
    console.info('Nenhum canal de notificação encontrado', site.url)
    return []
}

const notifyChannels = (site) => Promise.all(getNotifications(site).map(notf => {        

    if (notf.telegram.chat_id) {
        const message = templateFormat(site, notf.template)
        return TelegramDispatcher.notifyAll(message)
    } else if (notf.email && notf.email.length > 0) {
        const message = templateFormat(site, notf.template)
        return EmailDispatcher.sendEMail(notf.email, message)
    } else if (notf.webhook && notf.webhook.length > 0) {
        return WebHookDispatcher.send(notf.webhook, site)
    } if (notf.websocket) {
        return WebSocketDispacher.notifyWebSocket(site)
    }
    
}))


const executeSequentialRequest = async (req) => {
    if (req.then.length == 0) return

    const reqTmp = req.toObject()
    delete reqTmp._id

    const newReq = new SiteRequestModel(reqTmp)
    newReq.userId = req.userId

    if (!newReq.originalReq) newReq.originalReq = req

    newReq.url = getUrlsOnContent(req)[0]
    newReq.scriptTarget = newReq.then.pop()    
    newReq.scriptContent.push(newReq.scriptTarget)

    console.info('Executando Request sequencial...')

    return executeSiteRequests(newReq)
}


const validateAndNotify = async (req, exect) => {
    const skipValidation = req.originalReq !== undefined

    try {
        if (!exect.isSuccess)
            throw 'Execution failed'
        
        if (!skipValidation) {
            if (req.options.onlyChanged && !req.lastExecution.hashChanged) 
                throw 'Hash not changed'

            if (req.options.onlyUnique) {
                const isUnique = await executionService.countHash(req, exect) <= 0
                if (!isUnique) throw 'Hash not unique'
            }

            const filter = getFiltersFromSiteRequest(req)
            if (filter) {
                const { words, threshold} = filter
                if (!hasSimilarity(exect.extractedTarget, words, threshold)) {
                    throw 'Has no similarity with filters'
                }
            }
        }

        if (req.then.length > 0 && hasUrlsOnContent(req)) {
            return executeSequentialRequest(req)  // Async
        } else {
            notifyChannels(req) // Async
        }
        return req
    } catch (error) {
        console.info('Notification not sent: ', error)
    }            
}

const saveReq = (req) => {
    if (req.originalReq) {
        req.originalReq.lastExecution = req.lastExecution
        req.originalReq.save()
    } else {
        req.save()
    }
}

const mergeLastExecution = (req, exect) => {
    
    const newLastExecution = { 
        isSuccess: exect.isSuccess,
        createdAt: exect.createdAt
    }

    if (exect.isSuccess) {
        newLastExecution.extractedTarget = exect.extractedTarget
        
        // Sequential Request
        if (req.originalReq) {            
            newLastExecution.hashTarget = req.originalReq.lastExecution.hashTarget
            newLastExecution.printscreenLink = req.originalReq.lastExecution.printscreenLink
            newLastExecution.scriptContent = []        
            newLastExecution.extractedContent = []

            // ===== União dos ScriptContent ===== 
            if (req.lastExecution.scriptContent && req.lastExecution.scriptContent.length > 0)
            newLastExecution.scriptContent.push(...req.lastExecution.scriptContent)

            if (exect.scriptContent && exect.scriptContent.length > 0)
                newLastExecution.scriptContent.push(...exect.scriptContent)
            // ===== ===== ===== ===== ===== ===== 


            // ===== União dos ExtractedContent ===== 
            if (req.lastExecution.extractedContent && req.lastExecution.extractedContent.length > 0)
                newLastExecution.extractedContent.push(...req.lastExecution.extractedContent)

            if (exect.extractedContent && exect.extractedContent.length > 0)
                newLastExecution.extractedContent.push(...exect.extractedContent)        
            // ===== ===== ===== ===== ===== ===== 
        } else {
            newLastExecution.hashTarget = exect.hashTarget
            newLastExecution.scriptContent = exect.scriptContent
            newLastExecution.extractedContent = exect.extractedContent
            newLastExecution.printscreenLink = exect.printscreenLink
        }

    } else {
        newLastExecution.errorMessage = exect.errorMessage
    }
    
    return Object.assign(req, { lastExecution: newLastExecution })
}

const executeSiteRequests = (req) => execute(req)
    .then(async (exect) => {

        const hashChanged = req.lastExecution.hashTarget != exect.hashTarget
        mergeLastExecution(req, exect)

        const skip = req.originalReq !== undefined
        if (!skip) req.lastExecution.hashChanged = hashChanged
        
        
        saveReq(req)
        return validateAndNotify(req, exect)        
    })

const jobs = {}
const createJobExecutions = (req) => {
    console.info(`Starting job for ${req.url} runing each ${req.options.hitTime} minute`)
    return schedule(() => executeSiteRequests(req), `*/${req.options.hitTime} * * * *`)
        .then((data) => jobs[req.id] = data)
        .then(() => req)
}

const removeJobExecutions = (req) => {
    const job = jobs[req.id]
    job.stop()

    delete jobs[req.id]

    return req
}

const initJobsExecutions = () => {
    if (process.env.ENABLE_JOB !== 'true') return
    console.info('Iniciando job de notificação...')

    return SiteRequestModel
        .find({'options.isDependency': { $ne: true}})
        .populate('userId').exec()    
        .then(requests => requests.map(req => {
            executeSiteRequests(req)            
            createJobExecutions(req)
        }))

    // return SiteRequestModel.findById('5eb71ce9f65098001750bef0')
    //     .then((req) => {
    //         // console.log(req)

    //         // req.notifications.push({
    //         //     webpush: {
    //         //         url: "http://localhost:9002/api/v1/subtitle/receive",
    //         //         method: "POST"
    //         //     }
    //         // })

    //         // req.notifications.push({
    //         //     email: ['achimid@hotmail.com'],
    //         //     template: 'Olá, teste {0}'
    //         // })

    //         // req.notifications.push({
    //         //     telegram: {
    //         //         chat_id: "123",
    //         //         bot_token: "123"
    //         //     },
    //         //     template: 'Olá, teste {printscreenLink}'
    //         // })

    //         // req.save()
    //         // req.notifications[2].webhook[0].url = "http://localhost:9002/api/v1/subtitle/receive"
    //         req.options.onlyChanged = false
    //         req.options.onlyUnique = false
    //         executeSiteRequests(req)
    //     })
    //     .catch(() => console.log('Erro ao inicializar SchedulesRequests'))
}
    

module.exports = {
    initJobsExecutions,
    createJobExecutions,
    removeJobExecutions,
    executeSiteRequests
}