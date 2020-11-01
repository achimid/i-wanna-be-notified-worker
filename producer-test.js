require('dotenv').config()

const main = async () => {
    await require('./src/config/puppeteer')()
    await require('./src/config/database').databaseInit()

    const { execute } = require('./src/execution/execution-scraper')
    const { startExecution } = require('./src/execution/execution-service')

    // {
    //     name: document.querySelector('.entry-title').innerText.split(' [Ep.')[0],
    //     number: 'Episódio ' + document.querySelector('.entry-title').innerText.split(' [Ep.')[1].split(']')[0].trim(),
    //     url: window.location.href
    // }

    // JSON.stringify({name: document.querySelector('.entry-title').innerText.split(' [Ep.')[0], number: 'Episódio ' + document.querySelector('.entry-title').innerText.split(' [Ep.')[1].split(']')[0].trim(), url: window.location.href})

    let data = {
        "scriptContent": [
            "document.querySelector('.entry-title').innerText",
            "[...document.querySelectorAll('.entry-title.td-module-title a')].slice(0, 5).map(i => i.href)"
        ],
        "url": "https://hdsubs.org/",
        "name": "HD Subs",
        "regularity": "*/1 * * * *",
        "scriptTarget": "'[none]'",
        "options": {
            "levelMax": 1,
            "temporary": true
        }
    }
    // "url": "https://i-wanna-be-notified-catalog.herokuapp.com/api/v1/log",
    
    // https://www.kyoshirofansub.com/
    // https://kawaiiotome.com.br/
    // https://www.tenroufansub.com/
    // http://absolutesub.fansub.com.br/
    // https://elite.fansubs.com.br/
    // https://boteco.fansubs.com.br/
    // https://katawaredoki.fansubs.com.br/
    // https://nadjafansub.home.blog/
    // https://kallingfansub.wordpress.com/
    // https://kirinashi.fansubs.com.br/
    // https://mastercorpsfansubbers.blogspot.com/
    // https://sakuraanimes.com/
    // https://animeshouse.net/
    // https://www.anitube.site/
    // https://isekaisubs.com/
    // https://shinmeikai.net/*


    

    startExecution(data)
        .then(console.log)
        .catch(console.error)


}

main()




