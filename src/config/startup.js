const databaseInit = require('./database')
const browserInit = require('./puppeteer')
const { initQueue } = require('../utils/queue')

const init = () => browserInit()
    .then(databaseInit)
    .then(initQueue)
    .catch((err) => console.error('Erro on Statup project', err))

module.exports = {
    init
}
