const RandomHttpUserAgent = require('random-http-useragent')
const SiteExecutionModel = require('./se-model')
const crypto = require('crypto');
const fetch = require('node-fetch');
const ImagemUtils = require('../utils/imagem-util')

const toMD5 = (data) => crypto.createHash('md5').update(JSON.stringify({data})).digest("hex")

const getExecutionTime = (startTime) => process.hrtime(startTime)[1] / 1000000 // 0 = seconds, 1 = milisseconds

const promisseAllContinue = (artifact, item) => async () => {
    try {
        const result = await artifact.evaluate(item)
        return Promise.resolve(result)
    } catch (error) {
        return Promise.resolve(undefined)
    }                
}

const getPromissesEvaluation = (artifact, script) => {
    const promisses = []

    if (Array.isArray(script)) {
        script.forEach(item => promisses.push(promisseAllContinue(artifact, item)()))        
    } else {
        promisses.push(artifact.evaluate(script))
    }

    return promisses
}

const retryFetch = (page, url) => fetch(url)
    .then(res => res.text())
    .then((content) => page.setContent(content));

const applyOptionsConfig = async (page, options) => {
    if (options.useJquery) await page.addScriptTag({ url: process.env.JQUERY_URL_INJECTION })
    if (options.waitTime) await page.waitFor(options.waitTime)    
}


const execute = async (req) => {
    const { url, scriptTarget, scriptContent, options, userId }  = req

    const startTime = process.hrtime()
    
    const execution = new SiteExecutionModel({ url, scriptTarget, scriptContent, userId })

    console.info('Criando nova pagina')
    const page = await global.browser.newPage();

    try {

        if (process.env.ENABLE_USER_AGENT_RANDOM == 'true') {
            console.info('Setting user-agent')
            await page.setUserAgent(await RandomHttpUserAgent.get());
        }

        console.info('Navegando para Url', url)
        await page.goto(url, { waitUntil: 'networkidle0' })

        await applyOptionsConfig(page, options)

        console.info('Executando script')
        
        let responseTarget = null
        let responseContent = null
        let errorExec = null
        try {
            [responseTarget] = await Promise.all(getPromissesEvaluation(page, scriptTarget))
            responseContent = await Promise.all(getPromissesEvaluation(page, scriptContent))
        } catch (error) { errorExec = error }

        if (!responseTarget) { 
            console.info('Retentativa utilizando Fetch API')

            await retryFetch(page, url);
            await applyOptionsConfig(page, options);

            [responseTarget] = await Promise.all(getPromissesEvaluation(page, scriptTarget))
            responseContent = await Promise.all(getPromissesEvaluation(page, scriptContent))
        }

        console.info('Retorno do script target', url, responseTarget)
        console.info('Retorno do script content', url, responseContent)


        if (!responseTarget) {
            if (!errorExec) throw errorExec
            throw `Inválid response target: ${url} ==> ${responseTarget}`
        }

        if (options.printscreen || options.printscreenFullPage) {
            const path = ImagemUtils.generateImageFilePathName()
            
            await page.screenshot({path, fullPage: options.printscreenFullPage})
            
            const { link } = await ImagemUtils.uploadImage(path)
            execution.printscreenLink = link
            
            ImagemUtils.removeImageFileFileSystem(path)            
        }
        
        if (typeof responseTarget === 'string' || responseTarget instanceof String)
            responseTarget = responseTarget.trim()
        
        execution.isSuccess = true
        if (responseTarget) execution.extractedTarget = responseTarget
        if (responseContent) execution.extractedContent = responseContent
        execution.hashTarget = toMD5({result: responseTarget})

    } catch (error) {
        execution.isSuccess = false
        execution.errorMessage = error

        console.error(`Erro ao executar request script, ${url}: `, error)
    }

    execution.executionTime = getExecutionTime(startTime)
    console.info('Execution Time =======>>>>>>>>', execution.executionTime)

    await Promise.all([
        execution.save(),
        page.close()
    ])

    return execution
}

const countHash = (req, exect) => SiteExecutionModel.countDocuments({url: req.url, hashTarget: req.lastExecution.hashTarget, _id: { $ne: exect._id}})

module.exports = {
    execute,
    countHash
}