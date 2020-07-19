const Fuse = require('fuse.js')
const natural = require('natural');
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

    similarities = [...new Set(normalizedWordsSearch.map(key => fuse.search(key)).flat().map(({word}) => word))]

    return similarities
}

const hasSimilarity = (fullText, wordsSearch, threshold) => 
    findSimilarity(fullText, wordsSearch, threshold).length > 0

module.exports = {
    findSimilarity,
    hasSimilarity
}
