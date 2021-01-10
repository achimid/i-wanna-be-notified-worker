require('dotenv').config()

const main = async () => {
    await require('./src/config/puppeteer')()

    const { execute } = require('./src/execution/execution-crawler')
    const { startExecution } = require('./src/execution/execution-service')


    let data = {
        "url": "https://www.anbient.com/anime/new-game",
        "mode": "crawler",
        "options": {
            "enableUserAgentRandom": true
        },
        "scriptTarget": "'[None]'"
    }

    execute(data)
        .then(console.log)
        .catch(console.error)


}

main()
