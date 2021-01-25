require('dotenv').config()

const main = async () => {
    await require('./src/config/puppeteer')()
    await require('./src/config/database').databaseInit()

    const { execute } = require('./src/execution/execution-scraper')
    const { consumeIncoming } = require('./src/execution/execution-service')

    // {
    //     name: document.querySelector('.post-title').innerText.split('–')[0],
    //     number: 'Episódio ' + document.querySelector('.post-title').innerText.split('–')[1],
    //     url: window.location.href
    // }

    // JSON.stringify({name: document.querySelector('.post-title').innerText.split('–')[0], number: 'Episódio ' + document.querySelector('.post-title').innerText.split('–')[1], url: window.location.href})

    let data = {
        "url": "http://animestc.com/",
        "options": {
            "proxy": "socks5://achimid.ddns.net:9028"
        }
    }
    // "url": "https://i-wanna-be-notified-catalog.herokuapp.com/api/v1/log",
    
    
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


    

    consumeIncoming(data)
        .then(console.log)
        .catch(console.error)


}

main()




