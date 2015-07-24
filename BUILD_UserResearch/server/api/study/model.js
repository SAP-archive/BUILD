/*eslint key-spacing:0*/

'use strict';

var commonServer = require('norman-common-server'),
    Question = require('../question/model').getModel().schema,
    Annotation = require('../annotation/model').getModel().schema,
    Answer = require('../answer/model').getModel().schema,
    validator = require('./validate');

var mongoose = commonServer.db.mongoose;
var schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
var Study;


var inviteListSchema = schema({
    email: {type: String, trim: true},
    status: { type: String, default: 'sent', enum: ['sent', 'rejected'] }
}, {versionKey: false});

/**
 *  1. Need to create a sub-schema to support tracking of users activity within study i.e. anonymous true|false
 *  2. Do not genereate _id's here
 *  2. _id removal will ensure that duplicates are handled
 */
var participantListSchema = schema({
    _id: {
        type: ObjectId
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false,
    versionKey: false
});

participantListSchema.set('autoIndex', false);

var StudySchema = mongoose.createSchema('norman-user-research', {
    name: {
        type: String,
        validate: validator.studyName,
        required: true
    },
    projectId: {
        type: ObjectId,
        required: true
    },
    createBy: {
        type: ObjectId,
        required: true
    },
    updateBy: {
        type: ObjectId
    },
    description: {
        type: String,
        validate: validator.studyDescription
    },
    snapshotId: {
        type: ObjectId,
        ref: 'Snapshot'
    },
    createTime: {
        type: Date,
        default: Date.now
    },
    updateTime: {
        type: Date
    },
    questions: {
        type: [Question],
        default: []
    },
    answers: {
        type: [Answer],
        default: []
    },
    annotations: {
        type: [Annotation],
        default: []
    },
    messages: {
        type: [ObjectId],
        default: []
    },
    participants: {
        type: [participantListSchema],
        default: []
    },
    status: {
        type: String,
        default: 'draft',
        enum: ['draft', 'published', 'paused', 'archived']
    },
    deleted: {
        type: Boolean,
        default: false
    },
    teamAccessOnly: {
        type: Boolean,
        default: false
    },
     invite_list: [inviteListSchema]
}, {
    shardKey: {
        _id: 1
    },
    versionKey: false
});

// StudySchema.set('autoIndex', false);
StudySchema.index({
    participants: 1
});
// Dev-note: applying an index on the study ID, question Id and created by, this will allow a clone to be created as the
// study ID will be different.
StudySchema.index({
    _id: 1,
    'answers.questionId': 1,
    'answers.stats.created_by': 1
}, {
    unique: true,
    sparse: true
});

function getModel() {
    if (!Study) {
        Study = mongoose.createModel('Study', StudySchema);
    }
    return Study;
}

function createIndexes(done) {
    getModel().ensureIndexes();
    done();
}

module.exports = {
    createIndexes: createIndexes,
    getModel: getModel
};
