'use strict';
var crypto = require('crypto');
var commonServer = require('norman-common-server');
var model = require('./model');

var serviceLogger = commonServer.logging.createLogger('user.optout.service');
var registry = commonServer.registry;
var CommonError = commonServer.CommonError;

var OptOut, auditService;

function OptOutService() {
}

module.exports = OptOutService;

/**
 * Initialize
 * @param {function} done
 */
OptOutService.prototype.initialize = function (done) {
    serviceLogger.info('Initializing opt-out service');
    if (!OptOut) {
        OptOut = model.create();
    }

    if (typeof done === 'function') {
        done();
    }
};

/**
 * onInitialized
 * @param {function} done
 */
OptOutService.prototype.onInitialized = function (done) {
    var self = this;
    serviceLogger.debug('onInitialized');
    auditService = registry.getModule('AuditService');

    // Salt
    return Promise.resolve(OptOut.findOne({_id: '_0'}).lean().exec())
        .then(function (doc) {
            var salt;
            if (doc) {
                // Salt is already in db
                serviceLogger.debug('salt initialized');
                self.salt = doc.value;
            }
            else {
                // No salt in db, create it
                salt = commonServer.utils.token(32);
                return Promise.resolve(OptOut.create({_id: '_0', value: salt }))
                    .then(function () {
                        serviceLogger.info('salt created');
                        self.salt = salt;
                    })
                    .catch(function (err) {
                        var error = new CommonError('Unable to create salt', err);
                        serviceLogger.error(error);
                        throw error;
                    });
            }
        })
        .catch(function (err) {
            var error = new CommonError('Unable to initialize salt', err);
            serviceLogger.error(error);
            throw error;
        })
        .callback(done);
};

/**
 * shutdown
 * @param {function} done
 */
OptOutService.prototype.shutdown = function (done) {
    serviceLogger.info('shutdown');
    OptOut = null;
    model.destroy();
    if (typeof done === 'function') {
        done();
    }
};

OptOutService.prototype.getHash = function (email) {
    if (!this.salt) {
        throw new Error('Service not available, salt not initialized');
    }
    if (!email || (typeof email !== 'string')) {
        throw new TypeError('Missing or invalid email');
    }
    var hash = crypto.createHash('sha256');
    hash.update(this.salt + email.toLowerCase(), 'utf-8');
    return hash.digest('hex');
};

OptOutService.prototype.add = function (email, context) {
    return Promise.fnCall(this, 'getHash', email)
        .then(function (hash) {
            var update = {
                $unset: { value: '' }
            };
            var options = {
                new: false,
                upsert: true
            };
            serviceLogger.debug({ email: email }, 'Adding email opt-out');
            return Promise.resolve(OptOut.findByIdAndUpdate(hash, update, options).lean().exec());
        })
        .then(function (doc) {
            if (doc) {
                serviceLogger.debug('Email already registered');
            }
            else {
                serviceLogger.info({email: email}, 'Email opt-out added');
                auditService.logEvent('OptOut', 'add', 'Email opt-out added', {email: email}, context);
            }
            return !doc;
        })
        .catch(function (err) {
            var error = new CommonError('Unable to add email opt-out', err);
            serviceLogger.error(error);
            throw error;
        });
};

OptOutService.prototype.remove = function (email, context) {
    return Promise.fnCall(this, 'getHash', email)
        .then(function (hash) {
            serviceLogger.debug({ email: email }, 'Removing email opt-out');
            return Promise.resolve(OptOut.findByIdAndRemove(hash).lean().exec());
        })
        .then(function (doc) {
            if (doc) {
                serviceLogger.info({email: email}, 'Email opt-out removed');
                auditService.logEvent('OptOut', 'remove', 'Email opt-out removed', {email: email}, context);
            }
            else {
                serviceLogger.info('Unregistered email');
            }
            return !!doc;
        })
        .catch(function (err) {
            var error = new CommonError('Unable to remove email opt-out', err);
            serviceLogger.error(error);
            throw error;
        });
};

OptOutService.prototype.isOptedOut = function (email) {
    return Promise.fnCall(this, 'getHash', email)
        .then(function (hash) {
            return Promise.resolve(OptOut.findOne({_id: hash}).lean().exec());
        })
        .then(function (doc) {
            // Convert object to bool
            return !!doc;
        })
        .catch(function (err) {
            var error = new CommonError('Unable to check email opt-out', err);
            serviceLogger.error(error);
            throw error;
        });
};
