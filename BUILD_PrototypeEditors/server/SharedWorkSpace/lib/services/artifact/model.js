'use strict';

var mongoose = require('norman-common-server').db.mongoose,
    commonServer = require('norman-common-server'),
    serviceLogger = commonServer.logging.createLogger('artifact-model'),
    Grid,
    gridSchema = mongoose.createSchema('norman-shared-workspace-server', {}, {strict: false});

function createModel() {
    serviceLogger.info('>> create(), creating Artifact model');
    if (!Grid) {
        Grid = mongoose.createModel('Grid', gridSchema, 'artifacts.files');
    }
    return Grid;
}

gridSchema.set('autoIndex', false);
gridSchema.index({ 'metadata.projectId': 1, 'metadata.path': 1});

function createIndexes(done) {
    serviceLogger.debug('>> createIndexes(), checking Artifact model indexes');
    Grid.ensureIndexes();
    done();
}

function destroy(done) {
    serviceLogger.debug('>> destroy(), destroy Artifact model');
    Grid = undefined;
    done();
}

// create indexing method

module.exports = {
    create: createModel,
    createIndexes: createIndexes,
    destroy: destroy
};
