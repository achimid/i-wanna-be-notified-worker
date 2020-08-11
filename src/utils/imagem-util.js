const fs = require('fs')
const rimraf = require('rimraf')
const imgur = require('imgur-upload')

imgur.setClientID(process.env.IMGUR_CLIENT_ID)

const imgDir = '/tmp/img'

const uploadImage = (filePath) => new Promise((resolve, reject) => {
    imgur.upload(filePath, (err, res) => {
        try {
            if (err) return reject(err)
            if (res.data) return resolve({link: res.data.link, res})
            return resolve({link: res.detail, res})            
        } catch (err) {
            return reject(err)
        }
    })
}) 

const generateImageFilePathName = () => `${imgDir}/img${process.hrtime()[1]}.png`

const removeImageFileFileSystem = (filePath) =>  fs.unlinkSync(filePath)

!fs.existsSync(imgDir) && fs.mkdirSync(imgDir)

setInterval(() => {
    console.log('Cleaning images folder...')
    rimraf.sync(imgDir)
    console.log('Images folder removed...')
    !fs.existsSync(imgDir) && fs.mkdirSync(imgDir)
    console.log('Images folder created...')
}, process.env.CLEAR_IMAGES_TIMER)

module.exports = {
    generateImageFilePathName,
    removeImageFileFileSystem,
    uploadImage
}