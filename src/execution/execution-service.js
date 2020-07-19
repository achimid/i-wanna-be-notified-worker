const Execution = require('./execution-model')
const scraper = require('./execution-scraper')
const producer = require('./execution-producer')

const startExecution = async (data) => {

    return scraper.execute(data)
        .then(saveExecution)
        .then(notifyExecution)

}

const saveExecution = async (execution) => {
    return new Execution(execution).save()
}

const notifyExecution = async (execution) => {
    producer.notifyComplete({ 
        uuid: execution.uuid, 
        id: execution.id 
    })
}

module.exports = {
    startExecution
}