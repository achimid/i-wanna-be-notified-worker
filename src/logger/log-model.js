const mongoose = require("mongoose")

const schema = mongoose.Schema({    
    uuid: { type: String }, 
    executionTime: { type: String }, 
    log: { type: String }, 
    extra: { type: Object },
    createdAt: { type: Date, required: true, default: new Date() }
}, { versionKey: false, timestamps: false })

const MONTH = 60 * 60 * 24

schema.index({ createdAt: 1 }, { expireAfterSeconds : MONTH * 3 })

const ExecutionLog = mongoose.model("logs", schema)
module.exports = ExecutionLog