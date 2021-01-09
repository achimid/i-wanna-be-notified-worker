require('dotenv').config()

const main = async () => {
    await require('./src/config/puppeteer')()

    type: 'crawler | scraper'
    const siteUrl = 'https://www.animestc.net/'
    const scriptNavigate = "[...document.querySelectorAll('a')].map(e => e.href)"
    const scriptExtract = "document.querySelector('.series-header-title')?.innerText || '[No Content]'"

    let toExecute = new Array(siteUrl)
    const executed = new Set()
    const extracted = new Array()
    
    const page = await global.browser.newPage()  
    let counter = 0    

    console.time('executionComplete')
    
    // subDominios[3]
    // qtdePorDominios[500]
    
    while (toExecute.length > 0 && counter < 50) {
        const url = toExecute.shift()
        if (executed.has(url)) continue
        
        console.time('execution')
        
        executed.add(url)
        await page.goto(url)

        const allLinks = await page.evaluate(scriptNavigate)
        const content = await page.evaluate(scriptExtract)

        extracted.push({ url, content })
        
        allLinks
            // .filter(l => l.indexOf(siteUrl) >= 0)
            .filter(l => !executed.has(l))
            .map(l => toExecute.push(l))

        console.log(url)
        console.log(content)
        console.log(`Encontrados: [${allLinks.length}]`)
        console.log(`Para Navegar: [${toExecute.length}]`)
        console.log(`Navegados: [${executed.size}]`)
        console.timeEnd('execution')
        // console.log(toExecute)
        console.log('--------------------')

        toExecute = [...new Set(toExecute)]
        counter++
    }

    page.close()

    console.timeEnd('executionComplete')

    console.log(extracted)

}

main()




