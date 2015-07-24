'use strict';
var commonServer = require('norman-common-server');
var db = commonServer.db;
var serviceLogger = commonServer.logging.createLogger('audit-service');
var mongoose = db.mongoose;
var AuditModel;

var auditSchema = mongoose.createSchema('audit', {
	category: { type: String},
	event: { type: String},
	user: { type: String},
    username: { type: String},
	date: { type: Date},
	ipAddress: { type: String},
	description: { type: String},
	details: {}
}, {
    versionKey: false
});

auditSchema.set('autoIndex', false);
auditSchema.index({ date: -1, category: 1, event: 1});

function create() {
	if (!AuditModel) {
		serviceLogger.debug('Creating Audit model');
		AuditModel = mongoose.createModel('Audit', auditSchema);
	}
	return AuditModel;
}

function destroy(done) {
	AuditModel = undefined;
	serviceLogger.debug('Destroying Audit model');
	done();
}

function createIndexes(done) {
	serviceLogger.debug('Checking Audit model indexes');
	AuditModel.ensureIndexes();
	AuditModel.on('index', function (err) {
		if (err) {
			serviceLogger.error(err, 'Failed to create indexes for Audit collection');
			done(err);
		}
		else {
			serviceLogger.debug('Audit collection indexes verified');
			done();
		}
	});
}

module.exports = {
	create: create,
	createIndexes: createIndexes,
	destroy: destroy
};
