'use strict';

var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;
var schema = mongoose.Schema;
var serviceLogger = commonServer.logging.createLogger('project-model');
var Project;

var validatePresenceOf = function (value) {
    return value && value.length;
};

/**
 *  1. Need to create a sub-schema to remove _id's being generated,
 *  2. _id removal will ensure that duplicates are handled
 */
var userListSchema = schema({
    user_id: {type: String, trim: true},
    email: {type: String, trim: true}
}, {_id: false, versionKey: false});

var inviteListSchema = schema({
    email: {type: String, trim: true},
    user_id: {type: String, trim: true}
}, {_id: false, versionKey: false});

var rejectListSchema = schema({
    user_id: {type: String, trim: true},
    email: {type: String, trim: true}
}, {_id: false, versionKey: false});

/**
 * Project schema
 * 1. shardKey is _id
 * 2. primary key is _id
 * 3. default _id generation is now delegated out commonServer.utils.shardKey that generates shard-friendly identifier
 * 4. versionKey is disabled
 *
 * @type {mongoose.Schema}
 */
var projectSchema = mongoose.createSchema('norman-projects-server', {
    version: Number,
    name: {type: String, trim: true, required: true},
    description: {type: String, trim: true},
    stats: {
        created_at: {type: Date, default: new Date()},
        created_by: String,
        updated_at: {type: Date, default: new Date()},
        updated_by: String
    },
    deleted: {type: Boolean, default: false},
    archived: {type: Boolean, default: false},
    user_list: [userListSchema],
    invite_list: [inviteListSchema],
    reject_list: [rejectListSchema]
}, {shardKey: {_id: 1}, versionKey: false});

// Dev-note: http://mongoosejs.com/docs/guide.html
projectSchema.set('autoIndex', false);
// Common query to return all items deleted (true|false) and archived (true|false)
projectSchema.index({ deleted: 1, archived: 1 });

projectSchema.path('name').required(true, 'Project name cannot be blank');
projectSchema.pre('save', function (next) {
    if (!this.isNew) {
        return next();
    }

    if (!validatePresenceOf(this.name)) {
        next(new Error('Project name cannot be blank'));
    }
    else {
        next();
    }
});

function createIndexes(done) {
    serviceLogger.debug('>> createIndexes(), checking Project model indexes');
    Project.ensureIndexes();
    done();
}

function create() {
    serviceLogger.debug('>> create(), creating Project model');

    if (!Project) {
        Project = mongoose.createModel('Project', projectSchema, undefined, {cache: false});
    }
    return Project;
}

function destroy(done) {
    serviceLogger.debug('>> destroy(), destroy Project model');
    Project = undefined;
    done();
}

module.exports = {
    create: create,
    createIndexes: createIndexes,
    destroy: destroy
};
