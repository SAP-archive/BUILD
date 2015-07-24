'use strict';
var util = require('util');
var AuditModel = require('./audit.model');
var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('audit-service');

var systemContext = {
    ip: '::1',
    user: {
        _id: '0',
        name: 'SYSTEM'
    }
};

function AuditService() {
}

var auditModelInstance;
AuditService.prototype.initialize = function (done) {
    return new Promise(function (resolve, reject) {
        try {
            auditModelInstance = AuditModel.create();
            resolve(true);
            done();
        }
        catch (err) {
            serviceLogger.error(err, 'Failed to initialize audit service');
            done(err);
            reject(err);
        }
    });
};

AuditService.prototype.checkSchema = function (done) {
    AuditModel.createIndexes(done);
};

AuditService.prototype.findAuditEvents = function (options) {
    return auditModelInstance.find(options.criteria).lean().sort(options.result.sort).limit(options.result.limit);
};

AuditService.prototype.logSystemEvent = function (category, event, description, details, context) {
    var auditContext;
    if (context) {
        auditContext = {
            ip: context.ip || systemContext.ip,
            user: {
                _id: '0',
                name: 'Anonymous'
            }
        };
        util._extend(auditContext.user, context.user);
    }
    else {
        auditContext = systemContext;
    }
    return this.logEvent(category, event, description, details, auditContext);
};

AuditService.prototype.logEvent = function (category, event, description, details, context) {
    var auditEvent = {};
    if (!context || !context.user || !context.user._id) {
        serviceLogger.warn(new Error('Invalid audit context'));
    }
    context = context || {};
    context.user = context.user || { name: 'Anonymous' };
    auditEvent.category = category;
    auditEvent.event = event;
    auditEvent.user = context.user._id ? context.user._id.toString(): undefined;
    auditEvent.username = context.user.name;
    auditEvent.ipAddress = context.ip;
    auditEvent.description = description;
    auditEvent.details = details;
    auditEvent.date = new Date();
    return Promise.resolve(auditModelInstance.create(auditEvent))
        .catch(function (err) {
            serviceLogger.error(err, 'Failed to create audit Event');
            throw err;
        });
};

AuditService.prototype.destroy = function (done) {

};

module.exports = AuditService;
