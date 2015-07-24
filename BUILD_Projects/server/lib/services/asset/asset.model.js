'use strict';

var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;
var Asset;

var serviceLogger = commonServer.logging.createLogger('asset-model');

var gridSchema = mongoose.createSchema('norman-projects-server', {}, {strict: false});

function create() {
    serviceLogger.debug('>> create(), creating Asset model');

    if (!Asset) {
        Asset = mongoose.createModel('Asset', gridSchema, 'assets.files');
    }
    return Asset;
}

gridSchema.set('autoIndex', false);
gridSchema.index({'metadata.deleted': 1, 'metadata.version': 1, 'metadata.isThumb': 1, 'metadata.parent_id': 1, 'metadata.root': 1});
gridSchema.index({'metadata.entryPath': 1, 'metadata.studyPrototypeId': 1});

function createIndexes(done) {
    serviceLogger.debug('>> createIndexes(), checking Asset model indexes');
    Asset.ensureIndexes();
    done();
}

function destroy(done) {
    serviceLogger.debug('>> destroy(), destroy Asset model');
    Asset = undefined;
    done();
}

module.exports = {
    create: create,
    createIndexes: createIndexes,
    destroy: destroy
};
