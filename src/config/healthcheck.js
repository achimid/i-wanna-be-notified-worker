const router = require('express').Router()
const fetch = require('node-fetch')
const cron = require('node-cron')

const URL = process.env.API_URL + process.env.API_PREFIX + process.env.API_VERSION

// Keep API Alive
if (process.env.KEEP_UP != 'false') {
    console.info('Iniciando job healthcheck...')
    cron.schedule(process.env.CRON_TIME_DEFAULT , () => fetch(URL).then(() => console.info('ping...')))
}

// Health Check Endpoint
router.get('/', async (req, res) => { res.json({status: 'ok'}) })

module.exports = router