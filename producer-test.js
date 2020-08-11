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
        scriptContent: [
            "document.querySelector('.media-heading').textContent",
            "quality[target.findIndex(el => el === document.URL)]",
            "document.querySelector('.final') == null ? '' : new Promise((res) => {setTimeout(() => { const link = document.querySelector('.final').href; res(link); }, 10000) })",
            "target"
        ],
        url: "https://www.animestc.net",
        scriptTarget: "target=[];quality=[];async function click(){return Promise.resolve(Array.from(document.querySelectorAll('.episode-info-tabs')).forEach(release=>release.lastChild.click()))}async function getLink(){document.querySelectorAll('.episode-info-tabs').forEach(q=>quality.push(q.lastChild.textContent.trim()));Array.from(document.querySelectorAll('.episode-info-links')).forEach(link=>{const found=Array.from(link.childNodes).find(el=>el.innerText==='Drive ');target.push(typeof found!=='undefined'?found.href:'')});return Promise.resolve(target)}click().then(getLink).then(function(target){return target.length>0?target.toString():document.URL})",
        regularity: "*/5 * * * *",
        options: {
            useJquery: false,
            notifyChange: true,
            notifyUniqueChange: true,
            printscreenFullPage: true,
            levelMax: 1
        }
    }

    execute(data).then(console.log)

}

main()




