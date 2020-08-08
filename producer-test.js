require('dotenv').config()

const queue = require("./src/utils/queue")

const data = 

{
    "url": "https://www.animestc.net",
    "name": "AnimesTC",
    "regularity": "*/5 * * * *",
    "scriptTarget": "idxM = 5; [ ...document.querySelectorAll('.episode-info-row.episode-info-title')].slice(0, idxM).map(item => item.textContent.trim()).toString();",
    "scriptContent": [
        "document.querySelectorAll('.episode-info-row.episode-info-title')[0].textContent.trim();",
        "idx = 0; async function click() { const release = document.querySelectorAll('.episode-info-tabs')[idx]; release.childNodes[release.childNodes.length - 1].click(); return Promise.resolve(release); } async function getLink() { return Promise.resolve(Array.from(document.querySelectorAll('.episode-info-links')[idx].childNodes).find(el => el.innerText === 'Drive ').href); } click().then(getLink);",
        "idx = 1; async function click() { const release = document.querySelectorAll('.episode-info-tabs')[idx]; release.childNodes[release.childNodes.length - 1].click(); return Promise.resolve(release); } async function getLink() { return Promise.resolve(Array.from(document.querySelectorAll('.episode-info-links')[idx].childNodes).find(el => el.innerText === 'Drive ').href); } click().then(getLink);",
        "idx = 2; async function click() { const release = document.querySelectorAll('.episode-info-tabs')[idx]; release.childNodes[release.childNodes.length - 1].click(); return Promise.resolve(release); } async function getLink() { return Promise.resolve(Array.from(document.querySelectorAll('.episode-info-links')[idx].childNodes).find(el => el.innerText === 'Drive ').href); } click().then(getLink);",
        "idx = 3; async function click() { const release = document.querySelectorAll('.episode-info-tabs')[idx]; release.childNodes[release.childNodes.length - 1].click(); return Promise.resolve(release); } async function getLink() { return Promise.resolve(Array.from(document.querySelectorAll('.episode-info-links')[idx].childNodes).find(el => el.innerText === 'Drive ').href); } click().then(getLink);",
        "idx = 4; async function click() { const release = document.querySelectorAll('.episode-info-tabs')[idx]; release.childNodes[release.childNodes.length - 1].click(); return Promise.resolve(release); } async function getLink() { return Promise.resolve(Array.from(document.querySelectorAll('.episode-info-links')[idx].childNodes).find(el => el.innerText === 'Drive ').href); } click().then(getLink);",
        "new Promise((res) => {setTimeout(() => { const link = document.querySelector('.final').href; res(link); }, 10000) })"
    ],
    "options": {
        "useJquery": true,
        "notifyChange": true,
        "notifyUniqueChange": true,
        "printscreenFullPage": true
    },    
    "notifications": [
        {
            "level": 1,
            "telegram": [{}],            
            "template": "<a href=\"{execution.printscreenLink}\">📸🤓</a> <b>{monitoring.name} [0]</b>: <a href=\"{execution.extractedContent.6}\">{executions.0.extractedContent.0}</a>",
        }
    ]
}





// setInterval(() => {
// queue.sendToQueue("EXECUTION_INCOMING", data)
// }, 10000)


queue.sendToQueue("EXECUTION_INCOMING", data)

