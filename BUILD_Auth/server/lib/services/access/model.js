'use strict';

var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;
var schema = mongoose.Schema;
var serviceLogger = commonServer.logging.createLogger('accessRule-model');
var AccessRule;

// Validity period of an access rule in seconds
var VALIDITY_PERIOD = 7 * 24 * 60 * 60;

var scopeSchema = schema({
    name: {type: String, trim: true},
    permissions: {type: [String], trim: true}
}, {_id: false, versionKey: false});

var accessRuleSchema = mongoose.createSchema('accessRule', {
    _id: {type: String},
    scope: {type: [scopeSchema]},
    proposed_at: {type: Date, expires: VALIDITY_PERIOD},
    created_at: {type: Date, default: new Date()}
});

function create() {
    serviceLogger.debug('creating accessPolicy model');

    if (!AccessRule) {
        AccessRule = mongoose.createModel('AccessRule', accessRuleSchema, undefined, {cache: false});
    }

    return AccessRule;
}

function destroy() {
    serviceLogger.debug('destroy accessRule model');
    AccessRule = undefined;
}

module.exports = {
    create: create,
    destroy: destroy
};
