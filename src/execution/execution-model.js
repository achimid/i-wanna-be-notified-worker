const mongoose = require("mongoose")

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
    message: { 
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
    errorOnExecuteScriptTarget: { type: Object }
}, { versionKey: false, timestamps: true })

const Execution = mongoose.model("executions", schema)
module.exports = Execution