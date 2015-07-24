/*eslint key-spacing:0*/

'use strict';

var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;
var Schema = mongoose.Schema;
var serviceLogger = commonServer.logging.createLogger('studySnapshot-model');

var StudyPrototype;

var studyArtifactsSchema = new Schema({
    filename: {type: String},
    path: {type: String},
    id: {type: Schema.Types.ObjectId}
});

// The deeplinks object needed within the snapshot object
var studyDeepLinksSchema = new Schema({
    pageName: {type: String},
    thumbnail: {type: String},
    pageUrl: {type: String}
});

// The representation of the pages within the studyPrototype metadata
var studyPrototypePageSchema = new Schema({
   name: { type: String, required: true },
   displayName: { type: String, required: true },
   pageUrl: { type: String, required: true },
   thumbnailUrl: { type: String }
});

// The overall prototype schema
var studyPrototypeSchema = mongoose.createSchema('prototype', {
    projectId: { type: Schema.Types.ObjectId },
    deleted: { type: Boolean, default: false },
    appMetadata: {
        model: {
            _id: {type: Schema.Types.ObjectId }, // not sure if this is needed
            appType: { type: String },
            uiLang: { type: String, required: true },
            pages: [studyPrototypePageSchema]
        }
    },
    artifacts: [studyArtifactsSchema],
    stats: {
        created_at: {type: Date, default: Date.now},
        created_by: {type: String}
    },
    snapshot: {
        version: { type: String, default: '1' },
        snapshotDesc: { type: String },
        snapshotUrl: { type: String },
        snapshotUILang: { type: String, default: 'html' },
        deepLinks : [studyDeepLinksSchema]
    },
    thumbnailsCreated: {type: Boolean, default: false}
}, {
    shardKey: {_id: 1},
    versionKey: false
});

studyPrototypeSchema.set('autoIndex', false);

function getModel() {
    if (!StudyPrototype) {
        serviceLogger.info('>> create(), creating Prototype model');
        StudyPrototype = mongoose.createModel('studyPrototype', studyPrototypeSchema);
        serviceLogger.info('>> create(), created Prototype model');
    }
    return StudyPrototype;
}

function createIndexes(done) {
    getModel().ensureIndexes();
    done();
}

module.exports = {
    createIndexes: createIndexes,
    getModel: getModel
};
