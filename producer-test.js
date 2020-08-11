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
            "target[0]",
            "target[1]",
            "target[2]",
            "target[3]",
            "target[4]",
            "target[5]",
            "target[6]",
            "target[7]",
            "target[8]",
            "target[9]",
            "target[10]",
            "target[11]",
            "target[12]",
            "target[13]",
            "target[14]",
            "target[15]",
            "target[16]",
            "target[17]",
            "target[18]",
            "target[19]",
            "target[20]",
            "target[21]",
            "target[22]",
            "target[23]",
            "target[24]",
            "target[25]",
            "target[26]",
            "target[27]",
            "target[28]",
            "target[29]",
            "target[30]"
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




