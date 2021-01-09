const config = require('../config/database-config')
const mongoose = require('../config/mongoose-multi-db')

const schema = mongoose.Schema({
    uuid: { 
        type: String, 
        required: true
    },
    url: { 
        type: String, 
        required: true
    },
    executed: {
        type: Boolean, 
        required: false
    },
    createdAt: { 
        type: Date, 
        required: true, 
        default: new Date()
    }
}, { versionKey: false, timestamps: false })

schema.index({ uuid: 1, url: 1 }, { unique: true })
schema.index({ createdAt: 1 }, { expireAfterSeconds : 60 * 60 * 5 })

module.exports = mongoose.model('contexts', schema, config)