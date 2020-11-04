const config = require('../config/database-config')
const mongoose = require('../config/mongoose-multi-db')

const schema = mongoose.Schema({
    url: { 
        type: String, 
        required: true
    },
    scriptTarget: { 
        type: String, 
        required: true 
    },
    uuid: { 
        type: String
    },
    monitoringId: { 
        type: String
    },
    level: { 
        type: Number
    },
    startTime: { 
        type: Date
    },
    endTime: { 
        type: Date
    },
    options: { 
        timeout: { type: Number },
        waitUntil: { type: String },
        enableUserAgentRandom: { type: Boolean },
        useJquery: { type: Boolean },
        scriptTagUrl: { type: String },
        waitTime: { type: Number },
        printscreen: { type: Boolean },
        printscreenFullPage: { type: Boolean },
        levelMax: { type: Number },
        proxy: { type: String }
    },
    filter: {
        threshold: Number,
        words: [{
            type: String
        }]
    },
    filterMatch: { type: Boolean },
    scriptContent: [{ 
        type: String
    }],
    hashTarget: {
        type: String
    },
    hashTargetChanged: {
        type: Boolean
    },
    hashTargetUnique: {
        type: Boolean
    },
    extractedTarget: {
        type: String
    },
    extractedTargetNormalized: {
        type: String
    },
    extractedContent: [{ 
        type: Object         
    }],
    isSuccess: {
        type: Boolean
    },
    executionTime: { 
        type: String
    },
    printscreenLink: {
        type: String
    },
    errorOnExecuteScriptTarget: { type: Object },
    errorOnPrintPage: { type: Object },
    errorOnUploadPrintscreen: { type: Object },
    errorOnRemovePrintscreen: { type: Object },
    errorOnExecuteScriptTarget: { type: Object },
    errorOnExecuteScriptTargetRetry: { type: Object },
    errorOnAddUserAgent: { type: Object },
    errorOnAccessUrl: { type: Object }
}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('executions', schema, config)