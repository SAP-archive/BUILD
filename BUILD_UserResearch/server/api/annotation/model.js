/*eslint key-spacing:0*/

'use strict';

var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose,
    ObjectId = mongoose.Schema.Types.ObjectId;

// Sentiment will default to 0 if not set
var AnnotationSchema = mongoose.createSchema('norman-user-research', {
    questionId : { type: ObjectId, required: true },
    url        : { type: String },
    pathName   : { type: String },
    hash       : { type: String },
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
    createBy   : { type: ObjectId, required: true },
    createTime : { type: Date, default: Date.now },
    absoluteX  : { type: Number },
    absoluteY  : { type: Number },
    scrollTop  : { type: Number, default: 0},
    scrollLeft : { type: Number, default: 0},
    comment    : { type: String, trim: true },
    sentiment  : { type: Number, min: 0, max: 3, default: 0 }
});

AnnotationSchema.set('autoIndex', false);

// export model
module.exports = mongoose.createModel('Annotation', AnnotationSchema);
var Annotation;
function getModel() {
    if (!Annotation) {
        Annotation = mongoose.createModel('Annotation', AnnotationSchema);
    }
    return Annotation;
}

function createIndexes(done) {
    getModel().ensureIndexes();
    done();
}

module.exports = {
    createIndexes: createIndexes,
    getModel: getModel
};
