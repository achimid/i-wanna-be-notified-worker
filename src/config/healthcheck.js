const router = require('express').Router()
const fetch = require('node-fetch')
const cron = require('node-cron')


const KEY = process.env.HEROKU_API_KEY
const APP = process.env.HEROKU_APP_NAME
const URL = process.env.API_URL + process.env.API_PREFIX + process.env.API_VERSION


// Health Check Endpoint
router.get('/', async (req, res) => { res.json({status: 'ok'}) })


const restarAppScheduler = () => {
    if (!KEY || !APP) return

    console.log('*************************')
    fetch(`https://api.heroku.com/apps/${APP}/dynos`, 
        {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.heroku+json; version=3',
                'Authorization': `Bearer ${KEY}`,
            },
        })
        .then(res => console.info(`Restarting application {${res.ok}}`))
        .catch(err => console.error(err))
}

const fetchHealthEndpoint = () => fetch(URL).then(() => console.info('ping...'))

// Keep API Alive
if (process.env.KEEP_UP != 'false') {
    console.info('Iniciando job de healthcheck...')
    cron.schedule(process.env.CRON_TIME_DEFAULT , fetchHealthEndpoint)

    console.info('Iniciando job de restart...')
    cron.schedule(process.env.CRON_TIME_RESTART , restarAppScheduler)
}


module.exports = router