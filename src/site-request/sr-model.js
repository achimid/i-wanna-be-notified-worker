const mongoose = require("mongoose")

const schema = mongoose.Schema({
    url: { 
        type: String,
        required: true
    },
    name: { 
        type: String
    },
    scriptTarget: {
        type: String,
        default: process.env.DEFAULT_JS_TARGET_SCRIPT
    },
    scriptContent: [{
        type: String
    }],
    filter: {
        threshold: Number,
        words: [{
            type: String
        }]
    },
    options: {
        hitTime: {type: Number, default: process.env.OPTIONS_DEFAULT_HIT_TIME},
        onlyChanged: {type: Boolean, default: process.env.OPTIONS_DEFAULT_ONLY_CHANGED},
        onlyUnique: {type: Boolean, default: process.env.OPTIONS_DEFAULT_ONLY_UNIQUE},
        useJquery: {type: Boolean, default: process.env.OPTIONS_DEFAULT_USE_JQUERY},
        waitTime: {type: Number, default: process.env.OPTIONS_DEFAULT_WAIT_TIME},
        isDependency: {type: Boolean, default: process.env.OPTIONS_DEFAULT_IS_DEPENDENCY},
        printscreen: {type: Boolean, default: process.env.OPTIONS_DEFAULT_PRINTSCREEN},
        printscreenFullPage: {type: Boolean, default: process.env.OPTIONS_DEFAULT_PRINTSCREEN_FULL_PAGE},
    },
    lastExecution: {
        message: { 
            type: String
        },
        scriptContent: [{ 
            type: String
        }],
        isSuccess: {
            type: Boolean
        },    
        hashTarget: {
            type: String
        },
        hashChanged: {
            type: Boolean
        },
        extractedTarget: {
            type: String
        },
        extractedContent: [{ 
            type: Object
        }],
        errorMessage: {
            type: String
        },
        printscreenLink: {
            type: String
        },
        createdAt: {
            type: Date
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'user'
    },
    then: [{ type: String }],
    notifications: [{ // Deve refletir o mesmo atributo em sr-mode.js
        
		template: { type: String },
		email: [{ type: String }],
		sms: [{ type: String }],

		telegram: {
			bot_token: { type: String },
			chat_id: { type: String },
		},

		webhook: [{
			url: { type: String },
			method: { type: String }
		}],

        websocket: { type: Boolean }
        
	}]
        
}, { versionKey: false, timestamps: true})

const SiteRequest = mongoose.model("site-request", schema)

module.exports = SiteRequest
