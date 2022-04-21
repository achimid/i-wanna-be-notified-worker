const puppeteer = require('puppeteer');

// let browser = null

// const uploadFile = async (file) => {
    
//     const page = await browser.newPage();
//     await page.goto('https://www.zippyshare.com/');

//     // await page.evaluate(`document.querySelector('#browse').click()`);    

//     // get the ElementHandle of the selector above
//     const inputUploadHandle = await page.$('input[type=file]');

//     // prepare file to upload, I'm using test_to_upload.jpg file on same directory as this script
//     // Photo by Ave Calvar Martinez from Pexels https://www.pexels.com/photo/lighthouse-3361704/
//     let fileToUpload = file;

//     // Sets the value of the file input to fileToUpload
//     inputUploadHandle.uploadFile(fileToUpload);

//     await delay(2000)

//     // doing click on button to trigger upload file
//     await page.evaluate(`document.querySelector('#share_button').click()`)
//     await page.waitForSelector('#plain-links')

//     await page.waitForFunction(
//         () => {                        
//             return document.querySelector('#plain-links').value != ""
//         },
//         { polling: 'raf', timeout: 0 },
//     )
    
//     const url = await page.evaluate(`document.querySelector('#plain-links').value`)
    
//     console.log(url)
//     await page.close()

//     return url
// }


// const downloadFile = async (url) => {
        
//     const page = await browser.newPage();
//     await page.goto(url);
        
//     await page.evaluate(`document.querySelector('#dlbutton').click();`);

//     await delay(2000);

//     await page.goto('chrome://downloads/');
//     await page.bringToFront()

//     await delay(2000);

//     await page.waitForFunction(
//         () => {            
//             const dm = document.querySelector('downloads-manager').shadowRoot
//             return !dm.querySelector('#frb0').shadowRoot.querySelector('#show').hidden
//         },
//         { polling: 'raf', timeout: 0 },
//     )

//     console.log("Download finalizado")    
//     await page.close()

// }


function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}


// (async () => {
//     browser = await puppeteer.launch({ headless: false });

//     const url = await uploadFile('/home/lourran/Downloads/teste/output000.mp4')

//     await downloadFile(url)
// })()

// const { exec } = require('child_process');

// (async () => {
//     const baseDir = '/home/lourran/Downloads/teste'
//     const inputFile = 'output000.mp4'
//     const outputFile = 'output2.mp4'

//     const command = `time ffmpeg -i ${inputFile} -c:v libx264 -crf 27 -preset slow -c:a aac -b:a 128k \-movflags +faststart -vf ${inputFile.endsWith('.mkv') ? `subtitles=${inputFile},` : ''}scale=-2:1080,format=yuv420p ${outputFile} -y`

//     console.log(command)

//     const valor = await new Promise((done, error) => {
//         exec(command, {cwd: baseDir}, function(err, stdout, stderr) { 
//             if (err) { return error(err) }            
//             done(stdout) 
//         })
//     })

//     console.log(valor)    
// })()

const downloadFromDrive = async (page, url) => {

    console.log("Nevigate to Drive Download page")
    
    try {
        console.log("Trying to start download")
        await page.goto(url);
        await page.waitForFunction(
            () => {            
                return !!document.querySelector('#uc-download-link')
            },
            { polling: 'raf', timeout: 1000 },
        )

        const fileName = await page.evaluate(`document.querySelector('a').innerText`)
        console.log("File Name: " + fileName)

        await page.evaluate(`document.querySelector('#uc-download-link').click()`)
    } catch (error) {
        console.error("!!!!! Error on download from Drive !!!!! ")
        throw error
    }
    
    console.log("Checking for download status")
    await delay(2000)

    await page.goto('chrome://downloads/')
    await page.bringToFront()

    await delay(2000);

    console.log("Waiting for download")
    await page.waitForFunction(
        () => {            
            const dm = document.querySelector('downloads-manager').shadowRoot
            return !dm.querySelector('#frb0').shadowRoot.querySelector('#show').hidden
        },
        { polling: 'raf', timeout: 0 },
    )

    console.log("Download finished")
}


const downloadFromGofile = async (page, url) => {

    console.log("Nevigate to GoFile Download page")
    
    try {
        console.log("Trying to start download")
        
        await page.goto(url);
        await page.waitForFunction(
            () => {            
                return !!document.querySelector('#contentId-download')
            },
            { polling: 'raf', timeout: 0 },
        )

        const fileName = await page.evaluate(`document.querySelector('.contentName').innerText`)
        console.log("File Name: " + fileName)

        await page.evaluate(`document.querySelector('#contentId-download').click()`);
    } catch (error) {
        console.error("!!!!! Error on download from Gofile !!!!! ")
        throw error
    }
    
    console.log("Checking for download status")
    await delay(2000)

    await page.goto('chrome://downloads/')
    await page.bringToFront()

    await delay(2000);

    console.log("Waiting for download")
    await page.waitForFunction(
        () => {            
            const dm = document.querySelector('downloads-manager').shadowRoot
            return !dm.querySelector('#frb0').shadowRoot.querySelector('#show').hidden
        },
        { polling: 'raf', timeout: 0 },
    )

    console.log("Download finished")
}

const getLinksFromAnimesTCHome = async (page) => {
    console.log("Navigating to AnimesTC")
    await page.goto('https://www.animestc.net/');
    
    const protectedLinks = await page.evaluate(`
        function sleep(time) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, time);
            });
        }
        
        Promise.all([...document.querySelectorAll('header.episode-info-title')].map(async (header) => {
        
            // Click on MP4 quality    
            const qualityMP4Btn = header.parentElement.querySelector('.episode-info-tabs-item.episode-info-tabs-item-blue')
            if (qualityMP4Btn) {
                qualityMP4Btn.click()
                await sleep(500)
            }    
        
            // Extract Links MP4
            const qualityMP4 = [...header.parentElement
                .querySelectorAll('.episode-info-links-item.episode-info-links-item-blue')]
                .map(e => {
                    return {
                        url: e.href,
                        mirror: e.innerText.trim()
                    }
                })
        
        
            // Click on 720p quality    
            const quality720pBtn = header.parentElement.querySelector('.episode-info-tabs-item.episode-info-tabs-item-green')
            if (quality720pBtn) {
                quality720pBtn.click()
                await sleep(500)
            }    
        
            // Extract Links 720p
            const quality720p = [...header.parentElement
                .querySelectorAll('.episode-info-links-item.episode-info-links-item-green')]
                .map(e => {
                    return {
                        url: e.href,
                        mirror: e.innerText.trim()
                    }
                })
        
        
            // Click on 1080p quality    
            const quality1080pBtn = header.parentElement.querySelector('.episode-info-tabs-item.episode-info-tabs-item-red')
            if (quality1080pBtn) {
                quality1080pBtn.click()
                await sleep(500)
            }    
        
            // Extract Links 1080p
            const quality1080p = [...header.parentElement
                .querySelectorAll('.episode-info-links-item.episode-info-links-item-red')]
                .map(e => {
                    return {
                        url: e.href,
                        mirror: e.innerText.trim()
                    }
                })
                
            return {
                title: header.innerText,
                FullHD: quality1080p,
                HD: quality720p,
                SD: qualityMP4
            }
        }))
    `)

    console.log(`Animes found: ${protectedLinks.length}`)

    return protectedLinks
}

const getLinksDesprotected = async (page, link, type = "Drive") => {
    
    console.log("Desprotecting link: " + link)
    await page.goto(link)
    await delay(4000)

    const linkDesprotected = await page.evaluate(`
        id = document.querySelector('#link-id').getAttribute("value");

        fetch("https://protetor.animestc.xyz/api/link/" + id)
            .then(res => res.json())
            .then(body => body.link) 
    `)

    console.log("Link desprotected: " + linkDesprotected)

    if (type === "Drive") {
        const fileId = linkDesprotected.replace('https://drive.google.com/file/d/', '').replace('/view', '').replace('?usp=sharing', '')
        const driveUrlDesprotected = `https://drive.google.com/u/1/uc?id=${fileId}&export=download`

        console.log("Link desprotected Drive: " + driveUrlDesprotected)

        return driveUrlDesprotected
    }    
    
    return linkDesprotected
}

// Driver
(async () => {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()

    const linksData = await getLinksFromAnimesTCHome(page)
    
    await page.close()
    
    for (let index = 0; index < linksData.length; index++) {
        const data = linksData[index];

        const page2 = await browser.newPage()
        
        console.log("Trying to download: " + data.title)
            
        let hasError = true

        try {
            const linkDesprotected = await getLinksDesprotected(page2, data.FullHD.filter(d => d.mirror == "Drive")[0].url, "Drive")
            await downloadFromDrive(page2, linkDesprotected)
            hasError = false
        } catch (error) {}
        if (!hasError) continue


        try {
            const linkDesprotected = await getLinksDesprotected(page2, data.FullHD.filter(d => d.mirror == "Gofile")[0].url, "Gofile")
            await downloadFromGofile(page2, linkDesprotected)    
            hasError = false
        } catch (error) {}
        if (!hasError) continue



        try {
            const linkDesprotected = await getLinksDesprotected(page2, data.HD.filter(d => d.mirror == "Drive")[0].url, "Drive")
            await downloadFromDrive(page2, linkDesprotected)
            hasError = false
        } catch (error) {}
        if (!hasError) continue


        try {
            const linkDesprotected = await getLinksDesprotected(page2, data.HD.filter(d => d.mirror == "Gofile")[0].url, "Gofile")
            await downloadFromGofile(page2, linkDesprotected)    
            hasError = false
        } catch (error) {}
        if (!hasError) continue



        try {
            const linkDesprotected = await getLinksDesprotected(page2, data.SD.filter(d => d.mirror == "Drive")[0].url, "Drive")
            await downloadFromDrive(page2, linkDesprotected)
            hasError = false
        } catch (error) {}
        if (!hasError) continue


        try {
            const linkDesprotected = await getLinksDesprotected(page2, data.SD.filter(d => d.mirror == "Gofile")[0].url, "Gofile")
            await downloadFromGofile(page2, linkDesprotected)    
            hasError = false
        } catch (error) {}
        if (!hasError) continue            


        await page2.close()
    }
}) ();



           



// Gofile
// (async () => {
//     const browser = await puppeteer.launch({
//         headless: false
//         // args: [ '--proxy-server=socks4://114.23.223.220:5678' ]
//     });
//     const page = await browser.newPage();
//     await page.goto('https://www.animestc.net/');
//     const allDriverLinks = await page.evaluate(`
//         document.querySelector('.episode-info-tabs-item-red').click();
//         [...document.querySelectorAll('.episode-info-links-item')].filter(e => e.innerText.trim() == "Gofile").map(e => e.href)
//     `);

//     console.log(allDriverLinks.length)
    
//     for (let index = 0; index <= 0; index++) {
//         const link = allDriverLinks[index];
        
//         console.log(link)

//         const page2 = await browser.newPage();
//         await page2.goto(link);

//         const urlDownload = await page2.evaluate(`
//             let id = document.querySelector('#link-id').getAttribute("value");
            
//             fetch("https://protetor.animestc.xyz/api/link/" + id)
//                 .then(res => res.json())
//                 .then(body => body.link)
//         `);

//         await page2.goto(urlDownload);
//         await page2.waitForFunction(
//             () => {            
//                 return !!document.querySelector('#contentId-download')
//             },
//             { polling: 'raf', timeout: 0 },
//         )

//         await page2.evaluate(`document.querySelector('#contentId-download').click()`);

//         await page.close()

//         await delay(2000);

//         await page2.goto('chrome://downloads/');
//         await page2.bringToFront()

//         await page2.waitForFunction(
//             () => {            
//                 const dm = document.querySelector('downloads-manager').shadowRoot
//                 return !dm.querySelector('#frb0').shadowRoot.querySelector('#show').hidden
//             },
//             { polling: 'raf', timeout: 0 },
//         )

//         console.log("Download finalizado")    
//         await page2.close()
//     }


// }) ();


// [...document.querySelectorAll('.episode-info-title')].map(header => {
//     const urlDrive = [...header.parentElement
//         .querySelectorAll('.episode-info-links-item.episode-info-links-item-green')]
//         .filter(e => e.innerText.trim() == "Drive")
//         .map(e => e.href)

//     const urlGofile = [...header.parentElement
//         .querySelectorAll('.episode-info-links-item.episode-info-links-item-green')]
//         .filter(e => e.innerText.trim() == "Gofile")
//         .map(e => e.href)

//     return {
//         title: header.innerText,
//         urlDrive,
//         urlGofile
//     }
// })