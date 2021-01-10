const config = require('../config/database-config')
const mongoose = require('../config/mongoose-multi-db')

const schema = mongoose.Schema({
    url: { 
        type: String, 
        required: true
    },
    scriptTarget: { 
        type: String
    },
    scriptNavigate: { 
        type: String
    },
    scriptContent: {
        type: [{ type: String }],
        default: undefined    
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
    mode: {
        type: String
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
        proxy: { type: String },
        filterDomain: { type: Boolean }
    },
    filter: {
        threshold: Number,
        words: {
            type: [{ type: String }],
            default: undefined    
        },
    },
    filterMatch: { 
        type: Boolean 
    },
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
    extractedContent: {
        type: [{ type: Object }],
        default: undefined    
    },
    extractedNavigate: {
        type: [{ type: Object }],
        default: undefined    
    },
    isSuccess: {
        type: Boolean
    },
    isLast: {
        type: Boolean
    },
    executionTime: { 
        type: String
    },
    printscreenLink: {
        type: String
    },
    errorOnPrintPage: { type: Object },
    errorOnUploadPrintscreen: { type: Object },
    errorOnRemovePrintscreen: { type: Object },
    errorOnExecuteScriptTarget: { type: Object },
    errorOnExecuteScriptTargetRetry: { type: Object },
    errorOnExecuteScriptNavigate: { type: Object },
    errorOnAddUserAgent: { type: Object },
    errorOnAccessUrl: { type: Object }
}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('executions', schema, config)