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
    scriptContent: [{ 
        type: String
    }],
    isSuccess: {
        type: Boolean
    },
    isNotified: {
        type: Boolean
    },
    hashTarget: {
        type: String
    },
    extractedTarget: {
        type: String
    },
    extractedContent: [{ 
        type: Object         
    }],
    executionTime: { 
        type: Number
    },
    message: { 
        type: String
    },
    errorMessage: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'user'
    },
    printscreenLink: {
        type: String
    },
}, { versionKey: false, timestamps: true })

const SiteExecution = mongoose.model("site-execution", schema)
module.exports = SiteExecution