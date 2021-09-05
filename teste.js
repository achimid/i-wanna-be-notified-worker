const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
      headless: false,
      args: [ '--proxy-server=socks4://114.23.223.220:5678' ]
    });
  const page = await browser.newPage();
  await page.goto('https://www.cartacapital.com.br/cartaexpressa/');
  const value = await page.evaluate(`
    new Promise((resolve) =>
        fetch("https://api2.animestc.com/episodes?order=created_at&direction=desc&page=1&ignoreIndex=false", {
            "credentials": "omit",
            "headers": {
                "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "cross-site"
            },
            "referrer": "https://www.animestc.net/",
            "method": "GET",
            "mode": "cors"
        }).then(res => res.json())
        .then(json => json.data.slice(0, 5).map(({title}) => title))
        .then(data => resolve(data))
    )
  `);
  
console.log(value)

})();