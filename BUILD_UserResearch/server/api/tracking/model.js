/*eslint key-spacing:0*/

'use strict';

var commonServer = require('norman-common-server');

var mongoose = commonServer.db.mongoose,
    ObjectId = mongoose.Schema.Types.ObjectId;
var Tracking;

/**
 * Understanding eventTypes
 * - pageView, tracks when a user loads a task or question
 * - navigation, tracks when a user is inside a task and is moving from Page A to Page B
 * - iFrameClick, tracks user behaviour inside the iframe i.e. clicking different items, buttons, tabs etc...
 */
var TrackingSchema = mongoose.createSchema('norman-user-research', {
    projectId: {
        type: ObjectId,
        required: true
    },
    studyId: {
        type: ObjectId,
        required: true
    },
    questionId: {
        type: ObjectId,
        required: true
    },
    eventType: {
        type: String,
        required: true,
        default: 'iframeClick',
        enum: ['pageview', 'navigation', 'iframeClick']
    },
    user: {
        type: ObjectId,
        required: true
    },
    // used for smart templates
    context:{
        context_type:{
            type: String
        },
        entity : {
            type: String
        },
        data : {
            type: String
        }
    },
    clickX: {
        type: Number
    },
    clickY: {
        type: Number
    },
    scrollLeft: {
        type: Number
    },
    scrollTop: {
        type: Number
    },
    domElementTag: {
        type: String,
        trim: true
    },
    domElementText: {
        type: String,
        trim: true
    },
    domElementId: {
        type: String,
        trim: true
    },
    domElementTargetUrl: {
        type: String,
        trim: true
    },
    domElementX: {
        type: Number
    },
    domElementY: {
        type: Number
    },
    domElementHeight: {
        type: Number
    },
    domElementWidth: {
        type: Number
    },
    pageHeight: {
        type: Number
    },
    pageWidth: {
        type: Number
    },
    pageTitle: {
        type: String,
        trim: true
    },
    pageUrl: {
        type: String,
        trim: true
    },
    pathName: {
        type: String,
        trim: true
    },
    hash: {
        type: String,
        trim: true
    },
    xPath: {
        type: String,
        trim: true
    },
    user_agent: {
        type: String,
        trim: true
    },
    referrer: {
        type: String,
        trim: true
    },
    locale: {
        type: String,
        trim: true
    },
    timezone: {
        type: String,
        trim: true
    },
    timezoneOffset: {
        type: String,
        trim: true
    },
    cookieEnabled: {
        type: Boolean
    },
    stats: {
        created_at: {
            type: Date,
            default: null
        },
        updated_at: {
            type: Date,
            default: null
        }
    }
}, {
    shardKey: {
        _id: 1
    },
    versionKey: false
});

TrackingSchema.set('autoIndex', false);
// Adding indexing on questionId and eventType
TrackingSchema.index({
    questionId: 1,
    eventType: 1
});

// export model
function getModel() {
    if (!Tracking) {
        Tracking = mongoose.createModel('Tracking', TrackingSchema);
    }
    return Tracking;
}

function createIndexes(done) {
    getModel().ensureIndexes();
    done();
}

module.exports = {
    createIndexes: createIndexes,
    getModel: getModel
};
