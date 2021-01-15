const crypto = require('crypto')

const toMD5 = (value) => crypto.createHash('md5').update(value).digest("hex") 

module.exports = {
    toMD5
}