const log = require('../utils/logger')

const { v4 } = require('uuid')
const crypto = require('crypto')
const fetch = require('node-fetch')
const ImagemUtils = require('../utils/imagem-util')
const RandomHttpUserAgent = require('random-http-useragent')
const useProxy = require('puppeteer-page-proxy')
const {isTrue, isFalse, isURL, getDomainOrigin} = require('../utils/commons')

const createExecutionVO = async (exec) => {
    const uuid = exec.uuid ? exec.uuid : v4()
    const startTime = new Date()
    
    exec.uuid = uuid
    exec.startTime = startTime

    log.info(exec , 'Starting extraction')

    if (!exec.scriptTarget) exec.scriptTarget = process.env.DEFAULT_JS_SCRIPT_TARGET
    if (!exec.scriptNavigate && exec.mode == 'crawler') exec.scriptNavigate = process.env.DEFAULT_JS_SCRIPT_NAVIGATE

    if (!exec.level) exec.level = 0
    

    if (!exec.options) exec.options = {}

    if (!exec.options.filterDomain) exec.options.filterDomain = true
    if (!exec.options.enableUserAgentRandom) exec.options.enableUserAgentRandom = true

    if (!exec.options.timeout) exec.options.timeout = process.env.DEFAULT_OPTIONS_TIMEOUT
    if (!exec.options.waitUntil) exec.options.waitUntil = process.env.DEFAULT_OPTIONS_WAIT_UNTIL
    if (!exec.options.printscreen) exec.options.printscreen = isTrue(process.env.DEFAULT_OPTIONS_PRINTSCREEN)
    if (!exec.options.printscreenFullPage) exec.options.printscreenFullPage = isTrue(process.env.DEFAULT_OPTIONS_PRINTSCREEN_FULL_PAGE)
   

    return exec
}

const preValidate = async (vo) => {
        
    return vo
}


const createNewPage = async (vo) => {

    if (!vo.page) {
        log.info(vo, 'Creating new page')
        vo.page = await global.browser.newPage()
        log.info(vo, 'New page created')
    } else {
        log.info(vo, 'Reusing page')
    }

    return vo
}

const setUserAgent = async (vo) => {
    if (isFalse(vo.options.enableUserAgentRandom)) {
        log.info(vo, 'UserAgentRandom ignored')
        return vo
    }

    log.info(vo, 'Setting UserAgentRandom')
    
    const userAgentRandom = await RandomHttpUserAgent.get()
    log.info(vo, 'UserAgent created', userAgentRandom)

    try {
        log.info(vo, 'Adding userAgent')
        await vo.page.setUserAgent(userAgentRandom)    
        log.info(vo, 'UserAgent added')
    } catch (errorOnAddUserAgent) {
        log.info(vo, 'Error on add userAgent', errorOnAddUserAgent)        
        return {...vo, errorOnAddUserAgent: errorOnAddUserAgent.message}
    }

    return {...vo, userAgentRandom}
}

const optionsPreGoto = async (vo) => {

    if (vo.options.proxy) {
        try {
            log.info(vo, 'Adding proxy')
            await useProxy(vo.page, vo.options.proxy)
            log.info(vo, 'Proxy added')
        } catch (errorOnAddProxy) {
            log.info(vo, 'Error on add proxy', errorOnAddProxy)        
            return {...vo, errorOnAddProxy: errorOnAddProxy.message}
        }        
    }

    return vo
}

const gotoUrl = async (vo) => {
    log.info(vo, 'Starting access to url')
    const { waitUntil, timeout } = vo.options

    try {
        await vo.page.goto(vo.url, { waitUntil, timeout })
        
        log.info(vo, 'Completed access to url', vo.url)    
    } catch (errorOnAccessUrl) {
        log.info(vo, 'Error on accessUrl', errorOnAccessUrl)        
        return {...vo, errorOnAccessUrl: errorOnAccessUrl.message}
    }    

    return vo
}

const optionsPosGoto = async (vo) => {
    if (isTrue(vo.options.useJquery)) {
        log.info(vo, 'Adding JQuery script tag')
        await vo.page.addScriptTag({ url: process.env.JQUERY_URL_INJECTION })
    }

    if (isTrue(vo.options.scriptTagUrl)) {
        log.info(vo, 'Adding others script tag', vo.options.scriptTagUrl)
        await vo.page.addScriptTag({ url: vo.scriptTagUrl })
    }

    if (isTrue(vo.options.waitTime)) {
        log.info(vo, `Waiting for ${vo.options.waitTime}ms option`)
        await vo.page.waitFor(vo.options.waitTime)
    }

    if (vo.options.proxy) {
        log.info(vo, `Removing proxy`)
        try { await useProxy(vo.page, null) } catch (e) {}
    }

    return vo
}


const executeScriptTarget = async (vo) => {
    if (!vo.extractedTarget && vo.errorOnExecuteScriptTarget)
        return vo

    try {
        log.info(vo, `Executing scriptTarget`)
        const extractedTarget = await vo.page.evaluate(vo.scriptTarget)

        log.info(vo, `ScriptTarget executed with success`)
        return {...vo, extractedTarget}
    } catch (errorOnExecuteScriptTarget) {
        log.info(vo, `Error on execute ScriptTarget`, errorOnExecuteScriptTarget)                
        return {...vo, errorOnExecuteScriptTarget: errorOnExecuteScriptTarget.message }
    }
}

const executeScriptTargetRetry = async (vo) => {
    if (!vo.errorOnExecuteScriptTarget) return vo
        
    try {
        log.info(vo, `Fetching page manually - Starging - Page navigation retry`)
        const extractedTarget = await fetch(vo.url).then(res => res.text())            
        log.info(vo, `Fetching page manually - Ending - Page navigation retry`)
        
        vo = await optionsPosGoto(vo)
        delete vo.errorOnExecuteScriptTarget

        return {...vo, extractedTarget}
    } catch (errorOnExecuteScriptTargetRetry) {
        log.info(vo, `Error on execute retry ScriptTarget`, errorOnExecuteScriptTargetRetry)
        return {...vo, errorOnExecuteScriptTargetRetry: errorOnExecuteScriptTargetRetry.message }
    }
    
}

const filterContainsDomain = (vo, value) => {
    if (typeof value === 'string') {
        if (value.indexOf(',') >= 0){
            value = value.split(',')
        } else if (value.indexOf(';') >= 0) {
            value = value.split(';')
        } else {
            value = [value]
        }            
    } else if (!Array.isArray(value)) {
        return value
    }

    value = Array.from(new Set(value))

    return value
        .filter(isURL)
        .filter(l => vo.options.filterDomain ? l.indexOf(getDomainOrigin(vo.url)) >= 0 : true)
}

const executeScriptNavigate = async (vo) => {

    if (!vo.scriptNavigate) return vo        
    log.info(vo, `Executing scriptNavigate`)    

    try {
        const extractedValue = await vo.page.evaluate(vo.scriptNavigate)
        const extractedNavigate = filterContainsDomain(vo, extractedValue)
        
        log.info(vo, `ScriptNavigate processed`)

        return {...vo, extractedNavigate }
    } catch (errorOnExecuteScriptNavigate) {
        log.info(vo, `Erro on execute scriptNavigate`, errorOnExecuteScriptNavigate)
        return {...vo, errorOnExecuteScriptNavigate: errorOnExecuteScriptNavigate.message }
    }

}

const executeScriptContent = async (vo) => {

    if (vo.scriptContent == undefined || vo.scriptContent.length == 0) return vo
        
    log.info(vo, `Executing scriptContent`)
    let extractedContent = await Promise.all(vo.scriptContent.map(async (script) => {
        try {
            const result = await vo.page.evaluate(script)
            return Promise.resolve(result)
        } catch (error) {
            log.info(vo, `Erro on execute ScriptContent`, { script, message: error.message })
            return Promise.resolve(`[No content]`)
        }    
    }))

    log.info(vo, `ScriptContent executed`, extractedContent)

    return {...vo, extractedContent}
    
}

const postExecuteScriptContent = async (vo) => {

    let { extractedContent } = vo

    try {
        log.info(vo, `Trying to flat extractedContent`)
        extractedContent = Array.prototype.concat.apply([], extractedContent)        
    } catch (error) {
        log.info(vo, `Error on flat extractedContent, ignored`)
    }

    if (extractedContent.length > 20) {
        log.info(vo, `extractedContent max size [20] reached, extractedContent truncated`)
        extractedContent = extractedContent.slice(0, 20)
    }    

    log.info(vo, `ScriptContent processed`, extractedContent)

    return {...vo, extractedContent}
}

const printPage = async (vo) => {
    if (isFalse(vo.options.printscreen) && isFalse(vo.options.printscreenFullPage)) {
        log.info(vo, `Printscreen page ignored`)
        return vo
    }
    
    const path = ImagemUtils.generateImageFilePathName()
    let printscreenLink = null
    
    try {
        log.info(vo, `Printing page`)
        await vo.page.screenshot({path, fullPage: vo.options.printscreenFullPage})
        log.info(vo, `Page printed`)
    } catch (errorOnPrintPage) {
        log.info(vo, `Error on print page`, errorOnPrintPage)
        return {...vo, errorOnPrintPage: errorOnPrintPage.message}
    }
       

    try {
        log.info(vo, `Uploaging printscreen`)
        const { link } = await ImagemUtils.uploadImage(path)
        printscreenLink = link
        log.info(vo, `Printscreen uploaded`)        
    } catch (errorOnUploadPrintscreen) {
        return {...vo, errorOnUploadPrintscreen: errorOnUploadPrintscreen.message}
    }

    
    try {
        log.info(vo, `Removing printscreen file`)
        await ImagemUtils.removeImageFileFileSystem(path)   
        log.info(vo, `Printscreen file removed`)                 
    } catch (errorOnRemovePrintscreen) {
        log.info(vo, `Error on remove printScreen`, errorOnRemovePrintscreen)
    }

    return {...vo, printscreenLink}
}

const closePage = async (vo) => {
    log.info(vo, `Closing page`)
    await vo.page.close()    
    log.info(vo, `Page closed`)

    delete vo.page
    return vo
}

const postExecute = async (vo) => {
    const endTime = new Date()
    const executionTime = (endTime.getTime() - vo.startTime.getTime()) + 'ms'
    log.info(vo, `Execution time: ${executionTime}`)
        
    // vo.extractedTarget = vo.extractedTarget ? vo.extractedTarget.toString() : vo.extractedTarget
    let extractedTargetNormalized = vo.extractedTarget

    log.info(vo, `Normalizando responseTarget`)
    if (typeof extractedTargetNormalized === 'string' || extractedTargetNormalized instanceof String) {
        extractedTargetNormalized = extractedTargetNormalized.trim()
    }
    
    log.info(vo, `Checking possible errors`)
    const isSuccess = !(vo.errorOnExecuteScriptTarget || vo.errorOnPrintPage || vo.errorOnUploadPrintscreen || vo.errorOnExecuteScriptTargetRetry)
    
    log.info(vo, `Gerando hashTarget`)
    const hashTarget = crypto.createHash('md5').update(JSON.stringify({data: extractedTargetNormalized})).digest("hex")    
    
    vo.extractedContent = vo.extractedContent && vo.extractedContent.length == 0 ? undefined : vo.extractedContent

    if (vo.mode != 'crawler') vo.isLast = true

    // Adição de possiveis logs

    log.info(vo, `End of execution`)

    return {...vo, endTime, executionTime, isSuccess, hashTarget}
}


const execute = async (exec) => {
    
    let vo = await createExecutionVO(exec)

    try {
        
        vo = await preValidate(vo)
        vo = await createNewPage(vo)
        vo = await setUserAgent(vo)
        vo = await optionsPreGoto(vo)

        vo = await gotoUrl(vo)
        vo = await optionsPosGoto(vo)
        vo = await executeScriptTarget(vo)
        // vo = await executeScriptTargetRetry(vo)
        vo = await executeScriptContent(vo)
        vo = await executeScriptNavigate(vo)
        vo = await postExecuteScriptContent(vo)
        vo = await printPage(vo)        
        
        vo = await closePage(vo)
        vo = await postExecute(vo)
        
    } catch (unespectedError) {
        log.info(vo, 'UnespectedError: ', unespectedError)
        return {...vo, unespectedError}
    }
    
    return vo
}

module.exports = {
    execute
}