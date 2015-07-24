'use strict';
var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;
var Schema = mongoose.Schema;
var serviceLogger = commonServer.logging.createLogger('prototype-model');
var Prototype, Version, PrototypeLock;


var artifactsSchema = new Schema({
    filename: {type: String},
    path: {type: String},
    id: {type: Schema.Types.ObjectId}
});

var deepLinksSchema = new Schema({
    pageName: {type: String},
    thumbnail: {type: String},
    pageUrl: {type: String}
});

var VersionSchema = mongoose.createSchema('version', {
    version: {type: Number},
    isSnapshot: {type: Boolean, default: false},
    isHistory: {type: Boolean, default: false},
    isInvalid: {type: Boolean, default: false},
    snapshot: {
        version: {type: String},
        snapshotDesc: {type: String},
        snapshotUrl: {type: String},
        snapshotUILang: {type: String},
        isSmartApp: {type: Boolean},
        deepLinks: [deepLinksSchema],
        stats: {
            created_at: {type: Date},   // explicitly needs to be updated
            created_by: {type: String}
        }
    },
    appMetadata: {type: Schema.Types.ObjectId, ref: 'appMetadata'},
    userResearchHeader: {type: Schema.Types.ObjectId, ref: 'userResearchHeader'},
    pageMetadata: [{type: Schema.Types.ObjectId, ref: 'pageMetadata'}],
    dataModelMetadata: [{type: Schema.Types.ObjectId, ref: 'dataModelMetadata'}],
    sampleMetadata: [{type: Schema.Types.ObjectId, ref: 'sampleMetadata'}],
    artifacts: [artifactsSchema],
    stats: {
        created_at: {type: Date, default: Date.now},
        created_by: {type: String}
    }
});

var prototypeSchema = mongoose.createSchema('prototype', {
    projectId: {type: Schema.Types.ObjectId},
    versions: [VersionSchema],
    deleted: {type: Boolean, default: false}
}, {
    shardKey: {_id: 1},
    versionKey: false
});

prototypeSchema.set('autoIndex', false);
prototypeSchema.index({projectId: 1});

var PrototypeLockSchema = mongoose.createSchema('prototypeLock', {
    projectId: {type: Schema.Types.ObjectId},
    lastModifedAt: {type: Date, expires: 900},
    sessionId: {type: String},
    userId: {type: String}
});

PrototypeLockSchema.set('autoIndex', false);
PrototypeLockSchema.index({projectId: 1}, {unique: true});


function createModel() {
    serviceLogger.debug('>> create(), creating Prototype and Version model');
    serviceLogger.info('Creating Prototype model');
    if (!Prototype) {
        Prototype = mongoose.createModel('prototype', prototypeSchema);
    }
    if (!Version) {
        Version = mongoose.createModel('version', VersionSchema);
    }
    if (!PrototypeLock) {
        PrototypeLock = mongoose.createModel('prototypeLock', PrototypeLockSchema);
    }
    return {
        Prototype: Prototype,
        Version: Version,
        PrototypeLock: PrototypeLock
    };
}

function createIndexes(done) {
    serviceLogger.debug('>> createIndexes(), checking Prototype model indexes');
    Prototype.ensureIndexes();
    PrototypeLock.ensureIndexes();
    done();
}


function destroy(done) {
    serviceLogger.debug('>> destroy(), destroy Prototype model');
    Prototype = undefined;
    Version = undefined;
    PrototypeLock = undefined;
    done();
}

module.exports = {
    create: createModel,
    createIndexes: createIndexes,
    destroy: destroy
};
