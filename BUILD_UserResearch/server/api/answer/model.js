/*eslint key-spacing:0*/

'use strict';

var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;
var ObjectId = mongoose.Schema.Types.ObjectId;
var states = 'not started/in progress/completed correctly/completed incorrectly/aborted'.split('/');
var Answer;

var answerSchema = mongoose.createSchema('norman-user-research', {
    questionId: {
        type: ObjectId,
        required: true
    },
    questionType: {
        type: String
    },
    stats: {
        created_at: {
            type: Date,
            default: new Date()
        },
        created_by: {
            type: ObjectId,
            required: true
        },
        updated_at: {
            type: Date
        },
        updated_by: String
    },
    answer: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: states,
        trim: true,
        lowercase: true,
        default: 'not started'
    },
    sentiment: {
        type: Number,
        min: 0,
        max: 3,
        default: 0
    }
}, {
    versionKey: false
});

answerSchema.path('questionId').required(true, 'Question ID cannot be blank');
answerSchema.set('autoIndex', false);

function getModel() {
    if (!Answer) {
        Answer = mongoose.createModel('Answer', answerSchema, undefined, {
            cache: false
        });
    }
    return Answer;
}

function createIndexes(done) {
    getModel().ensureIndexes();
    done();
}

module.exports = {
    createIndexes: createIndexes,
    getModel: getModel
};
