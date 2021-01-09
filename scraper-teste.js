require('dotenv').config()

const main = async () => {
    await require('./src/config/puppeteer')()

    const { execute } = require('./src/execution/execution-crawler')
    const { startExecution } = require('./src/execution/execution-service')

    // {
    //     name: document.querySelector('.post-title').innerText.split('–')[0],
    //     number: 'Episódio ' + document.querySelector('.post-title').innerText.split('–')[1],
    //     url: window.location.href
    // }

    // JSON.stringify({name: document.querySelector('.post-title').innerText.split('–')[0], number: 'Episódio ' + document.querySelector('.post-title').innerText.split('–')[1], url: window.location.href})

    let data = {
        "url": "https://www.anbient.com/anime/new-game",
        "options": {
            "enableUserAgentRandom": true
            // "proxy": "socks5://achimid.ddns.net:9027"
        },
        "scriptTarget": "JSON.stringify({    api: ['anbient'],    tags: ['Anbient', 'Animes', 'Site Animes'],    siteName: 'Anbient',    siteUrl: 'https://www.anbient.com/',    pageUrl: location.href,    data: {         sinopse: document.querySelector('.anime-info .field-body > div.item').innerText,        name: document.querySelector('#page-title').innerText,        image: document.querySelector('.anime-info img').src,        fansub: document.querySelector('.field-fansub > .item').innerText,        generos: [...document.querySelectorAll('.field-generos')].map(e => e.innerText),        nota: document.querySelector('.field-nota').innerText,        screenshots: [...document.querySelectorAll('.field-screenshots img')].map(e => e.src),        estreia: document.querySelector('.field-estreia > .item').innerText,        episodios: document.querySelector('.field-num-episodios > .field-items').innerText,        download: {            file4go: [...document.querySelectorAll('.servidores-wrapper > .file4go li a')].map(e => {return {link: e.href, episodio: e.innerText}}),            uptobox: [...document.querySelectorAll('.servidores-wrapper > .uptobox li a')].map(e => {return {link: e.href, episodio: e.innerText}}),            userscloud: [...document.querySelectorAll('.servidores-wrapper > .userscloud li a')].map(e => {return {link: e.href, episodio: e.innerText}}),            zippyshare: [...document.querySelectorAll('.servidores-wrapper > .zippyshare li a')].map(e => {return {link: e.href, episodio: e.innerText}})                    }    }})"
    }

    startExecution(data)
        .then(console.log)
        .catch(console.error)


}

main()




