require('dotenv').config()

const databaseInit = require('./config/database')
const browserInit = require('./config/puppeteer')
const consumerInit = require('./execution/execution-consumer')

browserInit()
databaseInit()

setTimeout(consumerInit, 2000)


