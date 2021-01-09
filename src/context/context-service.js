const ContextModel = require('./context-model')

const processAndSaveExecutionsLink = async ({ extractedNavigate, uuid }) => {
    if (!extractedNavigate || extractedNavigate.length <= 0) return []

    const results = await ContextModel.findLean({uuid, url: { $in: extractedNavigate }})

    const linksUniqueToSave = extractedNavigate.filter(url1 => !results.map(({url}) => url).includes(url1))
    if (!linksUniqueToSave || linksUniqueToSave.length <= 0) return []

    const saveContextFunction = (url) => ContextModel.create({url, uuid}).then(() => url).catch(() => undefined)
    
    const savedLinks = await Promise.all(linksUniqueToSave.map(saveContextFunction))

    return savedLinks.filter(v => v)
}

const updateExecutionLinkAsExecuted = ({ url, uuid }) => ContextModel.updateMany({ url, uuid }, { executed: true })

const isLastExecutionInContext = ({ url, uuid }) => ContextModel.findLean({ uuid, url: { $ne: url }, executed: { $ne: true } }).then(finded => finded && finded.length <= 0)

ContextModel.deleteMany({}).catch(console.log)

module.exports = {
    processAndSaveExecutionsLink,
    updateExecutionLinkAsExecuted,
    isLastExecutionInContext
}