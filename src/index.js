require('dotenv').config()

const browserInit = require('./config/puppeteer')
const healthcheck = require('./config/healthcheck')
const { initConsumer } = require('./execution/execution-consumer')

const cors = require('cors')
const express = require('express')
const app = express()

browserInit()
    .then(initConsumer)

app.use(cors())
app.use(express.json())
app.disable('x-powered-by')
app.use('/api/v1', healthcheck)


app.listen(process.env.PORT)

