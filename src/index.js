require('dotenv').config()

const databaseInit = require('./config/database')
const browserInit = require('./config/puppeteer')
const consumerInit = require('./execution/execution-consumer')
const healthcheck = require('./config/healthcheck')

const cors = require('cors')
const express = require('express')
const app = express()

browserInit()
databaseInit()

setTimeout(consumerInit, 2000)

app.use(cors())
app.use(express.json())
app.disable('x-powered-by')
app.use('/api/v1', healthcheck)


app.listen(process.env.PORT)

