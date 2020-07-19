const format = require("string-template")

const parseRequestToResultMap = (req) => {
    const map = { ...req.lastExecution, url: req.url, name: req.name }
    req.lastExecution.extractedContent.map((item, index) => map[index] = item)
    return map
}

const templateFormat = (req, templateMessage) => {
    const resultMap = parseRequestToResultMap(req)
    return format(templateMessage, resultMap)
}

module.exports = {
    templateFormat
}
