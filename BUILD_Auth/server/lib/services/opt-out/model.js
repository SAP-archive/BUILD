'use strict';

var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;
var serviceLogger = commonServer.logging.createLogger('user.optout.model');
var OptOut;

var optOutSchema = mongoose.createSchema('optout', {
    _id: { type: String },
    value: { type: String }
}, {
    versionKey: false
});

function create() {
    serviceLogger.debug('creating email opt-out model');

    if (!OptOut) {
        OptOut = mongoose.createModel('OptOut', optOutSchema, undefined, {cache: false});
    }

    return OptOut;
}

function destroy() {
    serviceLogger.debug('destroy email opt-out model');
    OptOut = undefined;
}

module.exports = {
    create: create,
    destroy: destroy
};
