const SiteRequest = require('./sr-model')
// const serviceExecution = require('../site-execution/se-service')
const { createJobExecutions, removeJobExecutions, executeSiteRequests } = require('../notification/notify-job')

const validateExistsRequest = (req) => {
    if (!req) {
        throw "Requisição não existente"
    }
    return req
}

const create = (data) => new SiteRequest(data)
    .save()
    .then(createJobExecutions)

const update = (id, data) => SiteRequest.findByIdAndUpdate(id, data)
    .then(async () => {
        SiteRequest.findById(id).then(async (req) => {
            await removeJobExecutions()
            await createJobExecutions()
        })        
    })

const findByQuery = (params) => SiteRequest.find(params).exec()

const executeById = (id) => SiteRequest.findById(id)
    .then(validateExistsRequest)    
    .then(executeSiteRequests)

    
module.exports = {
    create,
    update,
    findByQuery,
    executeById
}