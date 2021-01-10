const cron = require('node-cron')
const puppeteer = require('puppeteer-extra')  
const stealthPlugin = require('puppeteer-extra-plugin-stealth')
const adblockerPlugin = require('puppeteer-extra-plugin-adblocker')

puppeteer.use(stealthPlugin())
puppeteer.use(adblockerPlugin({ blockTrackers: true }))

const proxy = process.env.PROXY_SERVER

const browserInit = async () => {
    console.info('Inicializando browser...')    
    
    global.browser = await puppeteer.launch(
        {
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--disable-web-security',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--disable-dev-shm-usage',
                proxy ? `--proxy-server=${proxy}` : ''
            ],
            userDataDir: '/tmp/pp'
        })
        
    console.info('Browser inicializado...')
}

// const browserRestart = async () => {

//     if (!global.browser) return
    
//     console.log('Closing all pages...')
//     for (const page of await global.browser.pages()) {
//         if (!await page.isClosed()) {
//             await page.close()        
//         }
//     }

//     console.log('Closing browser...')
//     await global.browser.close()

//     console.log('Clean browser variable...')
//     global.browser = null

//     await browserInit()    
// }

// console.info('Iniciando job de restart do puppeteer...')
// cron.schedule(process.env.CRON_TIME_RESTART_PUPPETEER , browserRestart)
// browserRestart().then(() => console.log('teste'))

module.exports = browserInit