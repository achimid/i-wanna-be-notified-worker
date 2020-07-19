const log = require('../logger/logger')
const { v4 } = require('uuid')
const crypto = require('crypto');
const fetch = require('node-fetch');
const ImagemUtils = require('../utils/imagem-util')
const RandomHttpUserAgent = require('random-http-useragent')

const createVO = async (exec) => {
    const uuid = exec.uuid ? exec.uuid : v4()
    const startTime = new Date()
    
    log.info({...exec, uuid, startTime} , 'Starting extraction')

    if (!exec.scriptTarget) exec.scriptTarget = process.env.DEFAULT_JS_TARGET_SCRIPT
    if (!exec.level) exec.level = 0
    
    if (!exec.options) exec.options = {}
    if (!exec.options.timeout) exec.options.timeout = process.env.DEFAULT_OPTIONS_TIMEOUT
    if (!exec.options.waitUntil) exec.options.waitUntil = process.env.DEFAULT_OPTIONS_WAIT_UNTIL
    if (!exec.options.printscreen) exec.options.printscreen = process.env.DEFAULT_OPTIONS_PRINTSCREEN
    if (!exec.options.printscreenFullPage) exec.options.printscreenFullPage = process.env.DEFAULT_OPTIONS_PRINTSCREEN_FULL_PAGE
    

    return {...exec, uuid, startTime}  
}

const createNewPage = async (vo) => {
    log.info(vo, 'Creating new page')
    const page = await global.browser.newPage()
    log.info(vo, 'New page created')

    return {...vo, page}
}

const setUserAgent = async (vo) => {
    if (!vo.options.enableUserAgentRandom) {
        log.info(vo, 'UserAgentRandom ignored')
        return vo
    }

    log.info(vo, 'Setting UserAgentRandom')
    
    const userAgentRandom = await RandomHttpUserAgent.get()
    log.info(vo, 'UserAgent created', userAgentRandom)

    await page.setUserAgent(userAgentRandom)
    log.info(vo, 'UserAgent added')

    return {...vo, userAgentRandom}
}

const optionsPreGoto = (vo) => {
    return vo
}

const gotoUrl = async (vo) => {
    log.info(vo, 'Starting access to url')
    const { waitUntil, timeout } = vo.options
    await vo.page.goto(vo.url, { waitUntil, timeout })
    log.info(vo, 'Completed access to url', vo.url)

    return vo
}

const optionsPosGoto = async (vo) => {
    if (vo.options.useJquery) {
        log.info(vo, 'Adding JQuery script tag')
        await vo.page.addScriptTag({ url: process.env.JQUERY_URL_INJECTION })
    }

    if (vo.options.scriptTagUrl) {
        log.info(vo, 'Adding others script tag', vo.options.scriptTagUrl)
        await vo.page.addScriptTag({ url: vo.scriptTagUrl })
    }

    if (vo.options.waitTime) {
        log.info(vo, `Waiting for ${vo.options.waitTime}ms option`)
        await vo.page.waitFor(vo.options.waitTime)
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
        return {...vo, errorOnExecuteScriptTarget }
    }
}

const executeScriptTargetRetry = async (vo) => {
    await fetch(vo.url).then(res => res.text()).then((content) => vo.page.setContent(content));
    return vo
}

const executeScriptContent = async (vo) => {
        
    log.info(vo, `Executing scriptContent`)
    const extractedContent = await Promise.all(vo.scriptContent.map(async (script) => {
        try {
            const result = await vo.page.evaluate(script)
            return Promise.resolve(result)
        } catch (error) {
            return Promise.resolve(error)
        }    
    }))

    log.info(vo, `ScriptContent executed`, extractedContent)
    return {...vo, extractedContent}
    
}

const printPage = async (vo) => {
    if (!vo.options.printscreen && !vo.options.printscreenFullPage) {
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
        return {...vo, errorOnPrintPage}
    }
       

    try {
        log.info(vo, `Uploaging printscreen`)
        const { link } = await ImagemUtils.uploadImage(path)
        printscreenLink = link
        log.info(vo, `Printscreen uploaded`)        
    } catch (errorOnUploadPrintscreen) {
        return {...vo, errorOnUploadPrintscreen}
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
        
    let extractedTargetNormalized = vo.extractedTarget

    log.info(vo, `Normalizando responseTarget`)
    if (typeof extractedTargetNormalized === 'string' || extractedTargetNormalized instanceof String) {
        extractedTargetNormalized = extractedTargetNormalized.trim()
    }
    
    log.info(vo, `Checking possible errors`)
    const isSuccess = !(vo.errorOnExecuteScriptTarget || vo.errorOnPrintPage || vo.errorOnUploadPrintscreen)
    
    log.info(vo, `Gerando hashTarget`)
    const hashTarget = crypto.createHash('md5').update(JSON.stringify({data: extractedTargetNormalized})).digest("hex")    
    
    // Adição de possiveis logs

    log.info(vo, `End of execution`)
    // log.info(vo, vo.extractedTarget)

    return {...vo, endTime, executionTime, extractedTargetNormalized, isSuccess, hashTarget}
}

const execute = async (execution) => {
    
    let vo = await createVO(execution)
    
    
    try {
        
        vo = await createNewPage(vo)
        vo = await setUserAgent(vo)
        vo = await optionsPreGoto(vo)
        vo = await gotoUrl(vo)
        vo = await optionsPosGoto(vo)
        vo = await executeScriptTarget(vo)
        vo = await executeScriptTargetRetry(vo)
        vo = await executeScriptContent(vo)
        vo = await printPage(vo)        
        vo = await closePage(vo)
        vo = await postExecute(vo)
        
    } catch (unespectedError) {
        log.info(vo, 'UnespectedError', unespectedError)
        return {...vo, unespectedError}
    }

    return vo
}

module.exports = {
    execute
}