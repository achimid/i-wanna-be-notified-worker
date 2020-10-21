const fetch = require('node-fetch')

const APP = process.env.HEROKU_APP_NAME
const KEY = process.env.HEROKU_API_KEY

fetch(`https://api.heroku.com/apps/${APP}/dynos`, {
        method: 'DELETE',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.heroku+json; version=3',
            'Authorization': `Bearer ${KEY}`,
        },
    })
    .then(res => console.log(`Restarting application {${res.ok}}`))