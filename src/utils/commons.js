const Fuse = require('fuse.js')
const natural = require('natural')
const tokenizer = new natural.WordTokenizer()

const findSimilarity = (fullText, wordsSearch, threshold = 0.1) => {

    const normalizedFullText = fullText.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()
    const normalizedWordsSearch = wordsSearch.map(w => w.normalize('NFD').toLowerCase())

    const wordsText = tokenizer.tokenize(normalizedFullText).map(word => {return {word}})
    
    var options = {
        threshold,
        keys: ['word']
    }

    const fuse = new Fuse(wordsText, options)

    try {
        return [...new Set(normalizedWordsSearch.map(key => fuse.search(key)).flat().map(({word}) => word))]        
    } catch (error) {
        console.info(error)
        return []
    }
}

const hasSimilarity = (fullText, wordsSearch, threshold) => 
    findSimilarity(fullText, wordsSearch, threshold).length > 0


const isURL = (str) => {
    const urlRegex = '^(?:(?:http|https)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$'
    const url = new RegExp(urlRegex, 'i')
    return (str.length < 2083 && url.test(str))
}

module.exports = {
    isURL,
    findSimilarity,
    hasSimilarity    
}