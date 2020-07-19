
const getUrlsOnContent = (req) => req.lastExecution.extractedContent
    .filter(str => str.indexOf('http') >= 0)

const hasUrlsOnContent = (req) => getUrlsOnContent(req).length > 0


const getFiltersFromSiteRequest = (site) => {
    if (site.filter && site.filter.words.length > 0) return site.filter
    if (site.userId && site.userId.filter && site.userId.filter.words.length > 0) return site.userId.filter
    return false
}

module.exports = {
    getUrlsOnContent,
    hasUrlsOnContent,
    getFiltersFromSiteRequest
}