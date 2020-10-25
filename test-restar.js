require('dotenv').config()

const main = async () => {
    await require('./src/config/puppeteer')()
    await require('./src/config/database').databaseInit()

    const { startExecution } = require('./src/execution/execution-service')
    const { execute } = require('./src/execution/execution-scraper')


    data = {        
        "url": "http://i-wanna-be-notified-api-01.herokuapp.com/api/v1",
        "name": "Ping test",
        "regularity": "*/15 * * * *",
        "scriptTarget": "document.querySelector('input').value"
    }

    execute(data)
        .then(console.log)
        .catch(console.error)


}

main()




