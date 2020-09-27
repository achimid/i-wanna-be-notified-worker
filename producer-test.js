require('dotenv').config()

const main = async () => {
    await require('./src/config/puppeteer')()
    await require('./src/config/database').databaseInit()

    const { execute } = require('./src/execution/execution-scraper')
    const { startExecution } = require('./src/execution/execution-service')

    // FenixSub
    let data = {
        "scriptContent": [
            "document.querySelector('h1').innerText.replace('SÉRIES\n', '') + ' - ' + [...document.querySelectorAll('.nome-ep')].pop()?.innerText",
            "[...document.querySelectorAll('#lista-posts .content > .link')].slice(0, 5).map(i => i.href)"            
        ],
        "_id": "5f6f73fb477f52001edf4fec",
        "url": "https://fenixfansub.com/",
        "name": "FenixSub",
        "scriptTarget": "[...document.querySelectorAll('#lista-posts .content')].slice(0, 15).splice(0, 5).map(i => i.innerText)",
        "regularity": "*/15 * * * *",
        "options": {
            "levelMax": 1,
            "notifyChange": true,
            "notifyUniqueChange": true
        },
    }


    // Animes Vision
    data = {
        "scriptContent": [
            "document.querySelector('h1').innerText.replace('SÉRIES\n', '') + ' - ' + [...document.querySelectorAll('.nome-ep')].pop()?.innerText",
            "[...document.querySelectorAll('#lista-posts .content > .link')].slice(0, 5).map(i => i.href)"            
        ],
        "_id": "5f6f73fb477f52001edf4fec",
        "url": "https://animesvision.biz/",
        "name": "FenixSub",
        "scriptTarget": "[...document.querySelectorAll('#lista-posts .content')].slice(0, 15).splice(0, 5).map(i => i.innerText)",
        "regularity": "*/15 * * * *",
        "options": {
            "levelMax": 1,
            "notifyChange": true,
            "notifyUniqueChange": true
        },
    }

    // InfiniteSub
    data = {
        "scriptContent": [
            "document.querySelector('h1').innerText.replace('SÉRIES\n', '') + ' - ' + [...document.querySelectorAll('.nome-ep')].pop()?.innerText",
            "[...document.querySelectorAll('#lista-posts .content > .link')].slice(0, 5).map(i => i.href)"            
        ],
        "_id": "5f6f73fb477f52001edf4fec",
        "url": "https://infinitefansub.com/",
        "name": "FenixSub",
        "scriptTarget": "[...document.querySelectorAll('#lista-posts .content')].slice(0, 15).splice(0, 5).map(i => i.innerText)",
        "regularity": "*/15 * * * *",
        "options": {
            "levelMax": 1,
            "notifyChange": true,
            "notifyUniqueChange": true
        },
    }

    // Kyoshiro Fansub
    data = {
        "scriptContent": [
            "document.querySelector('h1').innerText.replace('SÉRIES\n', '') + ' - ' + [...document.querySelectorAll('.nome-ep')].pop()?.innerText",
            "[...document.querySelectorAll('#lista-posts .content > .link')].slice(0, 5).map(i => i.href)"            
        ],
        "_id": "5f6f73fb477f52001edf4fec",
        "url": "https://www.kyoshirofansub.com/",
        "name": "FenixSub",
        "scriptTarget": "[...document.querySelectorAll('#lista-posts .content')].slice(0, 15).splice(0, 5).map(i => i.innerText)",
        "regularity": "*/15 * * * *",
        "options": {
            "levelMax": 1,
            "notifyChange": true,
            "notifyUniqueChange": true
        },
    }

    // HD Subs
    data = {
        "scriptContent": [
            "document.querySelector('h1').innerText.replace('SÉRIES\n', '') + ' - ' + [...document.querySelectorAll('.nome-ep')].pop()?.innerText",
            "[...document.querySelectorAll('#lista-posts .content > .link')].slice(0, 5).map(i => i.href)"            
        ],
        "_id": "5f6f73fb477f52001edf4fec",
        "url": "https://hdsubs.org/",
        "name": "FenixSub",
        "scriptTarget": "[...document.querySelectorAll('#lista-posts .content')].slice(0, 15).splice(0, 5).map(i => i.innerText)",
        "regularity": "*/15 * * * *",
        "options": {
            "levelMax": 1,
            "notifyChange": true,
            "notifyUniqueChange": true
        },
    }
    
    https://subvision.org/
    https://test-kun.com
    http://karinsensei.com/
    https://oldagesubs.com/
    https://kawaiiotome.com.br/
    https://www.tenroufansub.com/
    http://absolutesub.fansub.com.br/
    https://elite.fansubs.com.br/
    https://boteco.fansubs.com.br/
    https://katawaredoki.fansubs.com.br/
    https://nadjafansub.home.blog/
    https://kallingfansub.wordpress.com/
    https://kirinashi.fansubs.com.br/
    https://mastercorpsfansubbers.blogspot.com/
    https://sakuraanimes.com/
    https://animeshouse.net/
    https://www.anitube.site/
    https://isekaisubs.com/
    https://shinmeikai.net/*


    

    startExecution(data)
        .then(console.log)
        .catch(console.error)


}

main()




