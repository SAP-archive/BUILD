'use strict';

var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;
var serviceLogger = commonServer.logging.createLogger('history-model');

var History;

var eventLogSchema = mongoose.createSchema('norman-projects-server', {
    project_id: {type: String},
    date: {type: Date, default: new Date()},
    user: {type: String},
    resource_version: {type: Number},
    resource_id: {type: String},
    resource_type: {type: String},
    resource_name: {type: String},
    resource_url: {type: String},
    thumbnail_url: {type: String},
    description: {type: String}
}, {shardKey: {_id: 1}, versionKey: false});

eventLogSchema.set('autoIndex', false);
eventLogSchema.index({project_id: 1, resource_id: 1, resource_version: 1}, {unique: true});
eventLogSchema.index({project_id: 1});

function destroy(done) {
    serviceLogger.debug('>> destroy(), destroy History model');
    History = undefined;
    done();
}

function create() {
    serviceLogger.debug('>> create(), creating History model');

    if (!History) {
        History = mongoose.createModel('History', eventLogSchema, undefined, {cache: false});
    }

    return History;
}

function createIndexes(done) {
    serviceLogger.debug('>> createIndexes(), checking History model indexes');
    History.ensureIndexes();
    done();
}

module.exports = {
    create: create,
    createIndexes: createIndexes,
    destroy: destroy
};
