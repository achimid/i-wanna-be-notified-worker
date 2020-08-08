require('dotenv').config()

const main = async () => {
    await require('./src/config/puppeteer')()
    await require('./src/config/database').databaseInit()

    const { execute } = require('./src/execution/execution-scraper')

    // const data = {
    //     url: 'https://punchsubs.net/home',
    //     scriptTarget: "[...new Set([...document.querySelector('.cards-recentes').querySelectorAll('a')].map(v => v.innerText.trim()))].toString()",
    //     scriptContent: [
    //         "document.querySelectorAll('.card')[0].getAttribute('data-episodionumero').replace('Episódio', 'Episódio ')",
    //         "document.querySelector('.cards-recentes').querySelectorAll('a')[0].href",
    //         "document.querySelector('.cards-recentes').querySelectorAll('a')[1].href",
    //         "document.querySelector('.cards-recentes').querySelectorAll('a')[2].href",
    //         "document.querySelector('.cards-recentes').querySelectorAll('a')[3].href",
    //         "document.querySelector('.cards-recentes').querySelectorAll('a')[4].href",
    //         "document.querySelector('.cards-recentes').querySelectorAll('a')[5].href",
    //         "document.querySelector('.cards-recentes').querySelectorAll('a')[6].href",
    //         "document.querySelector('.cards-recentes').querySelectorAll('a')[7].href",
            
    //     ]
    // }


    const data = {
        url: 'https://punchsubs.net/projeto/3461/dokyuu-hentai-hxeros',
        scriptTarget: "[...new Set([...document.querySelector('.cards-recentes').querySelectorAll('a')].map(v => v.innerText.trim()))].toString()",
        scriptContent: [
            "document.querySelectorAll('.card')[0].getAttribute('data-episodionumero').replace('Episódio', 'Episódio ')",
            "document.querySelector('.cards-recentes').querySelectorAll('a')[0].href",
            "document.querySelector('.cards-recentes').querySelectorAll('a')[1].href",
            "document.querySelector('.cards-recentes').querySelectorAll('a')[2].href",
            "document.querySelector('.cards-recentes').querySelectorAll('a')[3].href",
            "document.querySelector('.cards-recentes').querySelectorAll('a')[4].href",
            "document.querySelector('.cards-recentes').querySelectorAll('a')[5].href",
            "document.querySelector('.cards-recentes').querySelectorAll('a')[6].href",
            "document.querySelector('.cards-recentes').querySelectorAll('a')[7].href",
            
        ],
        level: 1
    }

    execute(data).then(console.log)

}

main()




