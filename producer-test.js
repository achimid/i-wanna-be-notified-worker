require('dotenv').config()

const main = async () => {
    await require('./src/config/puppeteer')()
    await require('./src/config/database').databaseInit()

    const { execute } = require('./src/execution/execution-scraper')
    const { startExecution } = require('./src/execution/execution-service')

    const data = {
        "scriptContent": [
            "[...document.querySelectorAll('#menu2 > table tr')].map(i => i.innerText.trim()).splice(1)[0].split('/msg')[0].trim()"
        ],
        "_id": "5f6f73fb477f52001edf4fec",
        "url": "https://packs.ansktracker.net/",
        "name": "AnimeNSK",
        "scriptTarget": "[...document.querySelectorAll('#menu2 > table tr')].map(i => i.innerText.trim())",
        "regularity": "*/15 * * * *",
        "options": {
            "levelMax": 0,
            "notifyChange": true,
            "notifyUniqueChange": true
        },
    }

    startExecution(data)
        .then(console.log)
        .catch(console.error)


}

main()




