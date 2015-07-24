'use strict';
var commonCipher = require('node-sap-common').cipher;
require('node-sap-promise');

var defaultOptions = require('./options.js');
var utils = require('./utils');
var logAndThrow = utils.logAndThrow;
var decryptData = utils.decryptData;
var encryptData = utils.encryptData;
var decryptString = utils.decryptString;
var encryptString = utils.encryptString;

var HEADER_KEY = '__header__';
var MONGO_DUPLICATE_KEY_ERROR = 11000;

function getLogger(context) {
    return (context && context.logger) || SecureConfigService.defaultLogger;
}
function getAudit(context) {
    return (context && context.audit) || SecureConfigService.defaultAudit;
}

/**
 * @constructor
 */
function SecureConfigService() {
}

module.exports = SecureConfigService;

SecureConfigService.defaultCollection = defaultOptions.secureConfigCollection;
SecureConfigService.defaultLogger = defaultOptions.logger;
SecureConfigService.defaultAudit = defaultOptions.audit;
SecureConfigService.defaultCipherOptions = {
    algorithm: 'aes-256-cbc',
    keyLength: 32,
    ivLength: 16,
    digest: commonCipher.options.digest,
    iterationCount: commonCipher.options.iterationCount
};


function checkParameters(db, options) {
    if (typeof db !== 'object') {
        throw new TypeError('Missing mandatory db parameter');
    }
    if (typeof options !== 'object') {
        throw new TypeError('Missing mandatory options parameter');
    }
    if (typeof options.password !== 'string') {
        throw new TypeError('Missing options.password parameter');
    }
}

function createHeader(service, options, logger) {
    var serviceOptions = SecureConfigService.defaultCipherOptions;
    var cipherOptions = {
        algorithm: options.algorithm || serviceOptions.algorithm,
        keyLength: options.keyLength || serviceOptions.keyLength,
        ivLength: options.ivLength || serviceOptions.ivLength,
        iterationCount: options.iterationCount || serviceOptions.iterationCount
    };
    if (commonCipher.options.nodigest) {
        cipherOptions.digest = commonCipher.options.digest;
    }
    else {
        cipherOptions.digest = options.digest || serviceOptions.digest;
    }

    logger.debug('Initializing secure store and encryption key');
    return commonCipher.createCipherInit(options.password, undefined, cipherOptions)
        .then(function (init) {
            var header = {
                _id: HEADER_KEY,
                salt: init.salt,
                options: cipherOptions,
                v: 1
            };
            service.options = cipherOptions;
            service.cipher = {
                algorithm: cipherOptions.algorithm,
                key: init.key,
                iv: init.iv
            };
            service.v = header.v;
            header.check = encryptString(service.cipher, init.salt);
            return Promise.invoke(service.collection, 'insert', [ header ])
                .then(function () {
                    logger.debug('Secure store and encryption key initialized');
                    return true;
                });
        })
        .catch(function (err) {
            logger.error('Failed to initialize secure store and encryption key');
            throw err;
        });
}

function loadHeader(service, password, header, logger) {
    logger.debug('Initializing encryption key');
    return commonCipher.createCipherInit(password, header.salt, header.options)
        .then(function (init) {
            service.options = header.options;
            service.cipher = {
                algorithm: header.options.algorithm,
                key: init.key,
                iv: init.iv
            };
            service.v = header.v;
            service.oldPwd = header.oldPwd;

            if (decryptString(service.cipher, header.check) !== header.salt) {
                throw new Error('Password check failed');
            }

            logger.debug('Encryption key initialized');
            return true;
        })
        .catch(function (err) {
            logger.error('Failed to initialize encryption key');
            throw err;
        });
}

function initializeService(service, options, logger) {
    return Promise.invoke(service.collection, 'findOne', {_id: HEADER_KEY})
        .then(function (headerDoc) {
            if (headerDoc) {
                return loadHeader(service, options.password, headerDoc, logger);
            }
            return createHeader(service, options, logger);
        })
        .then(function () {
            service.initialized = true;
            logger.info('Secure configuration service initialized');
        });
}

function setOutdated(service) {
    service.initialized = false;
    service.initializing = Promise.reject(new Error('Service password is outdated'));
    return service.initializing;
}

function migrateConfig(service, config, context) {
    var logger = getLogger(context);
    var key = config._id;
    return Promise.fnCall(decodeOldPasswords, service)
        .then(function (oldPwd) {
            var cipher = oldPwd[config.v];
            if (!cipher) {
                throw new Error('Cannot read secure configuration for key ' + key + ': old password #' + config.v + ' unavailable');
            }
            cipher.key = new Buffer(cipher.key, 'base64');
            cipher.iv = new Buffer(cipher.iv, 'base64');

            var value = decryptData(cipher, config);
            logger.debug('Secure configuration with old password read for key:' + key);
            logger.info('Re-encrypting secure configuration for key ' + key);
            return service.set(key, value)
                .then(function () {
                    return {
                        _id: key,
                        value: value
                    };
                });
        });
}

function decodeOldPasswords(service) {
    var decodedPwd;
    if (service.decodedPwd) {
        return service.decodedPwd;
    }
    if (service.oldPwd) {
        decodedPwd = decryptData(service.cipher, service.oldPwd);
    }
    else {
        decodedPwd = {};
    }
    service.decodedPwd = decodedPwd;
    return decodedPwd;
}


/**
 * Creates and initializes an instance of Secure Configuration service.
 * @param {mongodb.Db} db Mongo DB connection
 * @param {object} options configuration parameters
 * @param {string} [options.algorithm] Encryption algorithm default to SecureConfigService.defaultCipherOptions.algorithm (initially 'aes-256-cbc')
 * @param {string} [options.keyLength] Encryption key length default to SecureConfigService.defaultCipherOptions.keyLength (initially 32)
 * @param {string} [options.keyLength] Encryption initialization vector length default to SecureConfigService.defaultCipherOptions.ivLength (initially 16)
 * @param {string} [options.digest] Digest algorithm to derive encryption key from password default default to SecureConfigService.defaultCipherOptions.digest (initially 'sha1' on node 0.10, 'sha256' on node 0.12+)
 * @param {string} [options.iterationCount] Number of PBKDF2 iterations algorithm to derive encryption key from password default default to SecureConfigService.defaultCipherOptions.digest (initially 'sha1' on node 0.10, 'sha256' on node 0.12+)
 * @parem {string} options.password Password from which to derive the key and iv
 * @param {string} [options.collection] Config collection name, default to SecureConfigService.defaultCollection ('secure-config' initially)
 * @param {object} [options.mongo] Mongo collection options
 * @param {object} [context] Context information
 * @param {Logger} [context.logger] Context logger to use. Logger must be compatible with node-sap-logging API.
 * @returns {SecureConfigService} initializing service instance
 */
SecureConfigService.create = function (db, options, context) {
    var service, logger;
    checkParameters(db, options);
    logger = getLogger(context);
    logger.debug('Initializing secure configuration service');
    service = new SecureConfigService();
    service.name = options.collection || SecureConfigService.defaultCollection;
    service.db = db;
    service.initializing = Promise.invoke(db, 'collection', service.name, options.mongo)
        .then(function (collection) {
            // load header from db or initialize it
            service.collection = collection;
            return initializeService(service, options, logger);
        })
        .catch(function (err) {
            logAndThrow(logger, 'Failed to initialize secure configuration service', err);
        });

    return service;
};

/**
 * Retrieves a configuration value
 * @param {string} key Configuration entry _id
 * @param {object} [context] Context information
 * @param {Logger} [context.logger] Context logger to use. Logger must be compatible with node-sap-logging API.
 * @returns {Promise} Promise eventually resolved to the configuration entry (an object with _id and value properties) or null if the entry is missing
 */
SecureConfigService.prototype.getConfig = function (key, context) {
    var logger, self = this;
    if (key.toString() === HEADER_KEY) {
        return Promise.reject(new Error('Cannot use reserved key "' + HEADER_KEY + '"'));
    }
    if (!this.initialized) {
        return this.initializing.then(function () {
            return self.getConfig(key, context);
        });
    }
    logger = getLogger(context);
    return Promise.invoke(this.collection, 'findOne', {_id: key})
        .then(function (config) {
            var value;
            if (!config || !config._id) {
                logger.debug('Secure configuration not found for key:' + key);
                return null;
            }
            if (config.v === self.v) {
                value = decryptData(self.cipher, config);
                logger.debug('Secure configuration read for key:' + key);
                return {
                    _id: key,
                    value: value
                };
            }
            if (config.v < self.v) {
                // Config entry has been encrypted with an old password it should be migrated
                return migrateConfig(self, config, context);
            }
            return setOutdated(self);
        })
        .catch(function (err) {
            logAndThrow(logger, 'Failed to retrieve secure configuration entry for key: ' + key, err);
        });
};

/**
 * Retrieves a configuration value
 * @param {string} key Configuration entry _id
 * @param {object} [context] Context information
 * @param {Logger} [context.logger] Context logger to use. Logger must be compatible with node-sap-logging API.
 * @returns {Promise} Promise eventually resolved to the configuration value or undefined if the entry is missing
 */
SecureConfigService.prototype.get = function (key, context) {
    return this.getConfig(key, context)
        .then(function (config) {
            var configValue = (config ? config.value : undefined);
            return configValue;
        });
};

/**
 * Sets a configuration value
 * @param {string} key Configuration entry _id
 * @param {string|object|Buffer} [value] Configuration entry value
 * @param {object} [context] Context information
 * @param {Logger} [context.logger] Context logger to use. Logger must be compatible with node-sap-logging API.
 * @param {function} [context.audit] Context audit function to use. Audit function must have the following signature audit(auditData, context) and return a Promise. auditData has the action and key properties
 * @returns {Promise}
 */
SecureConfigService.prototype.set = function (key, value, context) {
    var self = this;
    if (!this.initialized) {
        return this.initializing.then(function () {
            return self.set(key, value, context);
        });
    }
    var logger = getLogger(context), audit = getAudit(context);
    var options = {
        upsert: true,
        new: false  // return old version of document
    };
    var auditData = { key: key };
    return Promise.fnCall(
        function () {
            var encryptedData = encryptData(self.cipher, value);
            return {
                $set: {
                    type: encryptedData.type,
                    data: encryptedData.data,
                    v: self.v
                }
            };
        })
        .then(function (update) {
            return new Promise(function (resolve, reject) {
                // Update should fail if configuration has a higher password version
                self.collection.findAndModify({ _id: key, v: { $lte: self.v } }, [
                        ['_id', 1]
                    ], update, options,
                    function (err, result) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(result);
                    });
            });
        })
        .catch(function (err) {
            if (err.lastErrorObject && err.lastErrorObject.code === MONGO_DUPLICATE_KEY_ERROR) {
                return setOutdated(self);
            }
            throw err;
        })
        .then(function (oldDoc) {
            var created = !oldDoc || !oldDoc._id;
            if (created) {
                logger.info('Secure configuration created for key: ' + key);
                auditData.action = 'insert';
            }
            else {
                logger.info('Secure configuration updated for key: ' + key);
                auditData.action = 'update';
            }
            if (audit) {
                return Promise.resolve(audit(auditData, context))
                    .then(function () {
                        return created;
                    });
            }
            return created;
        })
        .catch(function (err) {
            logAndThrow(logger, 'Failed to insert or update secure configuration for key: ' + key, err);
        });
};

/**
 * Deletes a configuration entry
 * @param {string} key Configuration entry _id
 * @param {object} [context] Context information
 * @param {Logger} [context.logger] Context logger to use. Logger must be compatible with node-sap-logging API.
 * @param {function} [context.audit] Context audit function to use. Audit function must have the following signature audit(auditData, context) and return a Promise. auditData has the action and key properties
 * @returns {Promise}
 */
SecureConfigService.prototype.delete = function (key, context) {
    var self = this;
    if (!this.initialized) {
        return this.initializing.then(function () {
            return self.delete(key, context);
        });
    }
    var logger = getLogger(context), audit = getAudit(context), auditData = { key: key };
    return new Promise(
        function (resolve, reject) {
            self.collection.findAndRemove({ _id: key }, [
                ['_id', 1]
            ], function (err, result) {
                if (err) {
                    return reject(err);
                }
                if (!result || !result._id) {
                    result = null;
                }
                resolve(result);
            });
        })
        .then(function (oldDoc) {
            if (oldDoc) {
                logger.info('Secure configuration deleted for key: ' + key);
                auditData.action = 'delete';
                if (audit) {
                    return Promise.resolve(audit(auditData, context));
                }
            }
            else {
                logger.info('Secure configuration not found for key: ' + key + ', ignoring delete');
            }
        })
        .catch(function (err) {
            logAndThrow(logger, 'Failed to delete secure configuration for key: ' + key, err);
        });
};

/**
 * Changes the secure configuration master password
 * @param {string} newPassword
 * @param {object} [context] Context information
 * @param {Logger} [context.logger] Context logger to use. Logger must be compatible with node-sap-logging API.
 * @param {function} [context.audit] Context audit function to use. Audit function must have the following signature audit(auditData, context) and return a Promise. auditData has the action property
 * @returns {Promise}
 */
SecureConfigService.prototype.changePassword = function (newPassword, context) {
    var self = this;
    if (!this.initialized) {
        return this.initializing.then(function () {
            return self.changePassword(newPassword, context);
        });
    }
    var logger = getLogger(context), audit = getAudit(context);
    return commonCipher.createCipherInit(newPassword, undefined, this.options)
        .then(function (init) {
            var options = { new: false };
            var oldPwd = decodeOldPasswords(self);
            oldPwd[self.v] = {
                algorithm: self.options.algorithm,
                key: self.cipher.key.toString('base64'),
                iv: self.cipher.iv.toString('base64'),
                ts: Date.now()
            };
            self.cipher = {
                algorithm: self.options.algorithm,
                key: init.key,
                iv: init.iv
            };

            self.oldPwd = encryptData(self.cipher, oldPwd);
            var update = {
                $set: {
                    salt: init.salt,
                    v: ++self.v,
                    oldPwd: self.oldPwd,
                    check: encryptString(self.cipher, init.salt)
                }
            };
            return new Promise(
                function (resolve, reject) {
                    self.collection.findAndModify({ _id: HEADER_KEY, v: self.v - 1 }, [
                            ['_id', 1]
                        ], update, options,
                        function (err, result) {
                            if (err) {
                                return reject(err);
                            }
                            resolve(result);
                        });
                })
                .catch(function (err) {
                    if (err.lastErrorObject && err.lastErrorObject.code === MONGO_DUPLICATE_KEY_ERROR) {
                        return setOutdated(self);
                    }
                    throw err;
                });
        })
        .then(function () {
            logger.info('Secure configuration password changed');
            self.migrateAll(context); // Trigger key migration but do not wait for completion
            if (audit) {
                return Promise.resolve(audit({ action: 'change password' }, context));
            }
        })
        .catch(function (err) {
            logAndThrow(logger, 'Failed to change secure configuration password', err);
        });
};

/**
 * Migrates all secure configuration entries encrypted with an old password
 * @param {object} [context] Context information
 * @param {Logger} [context.logger] Context logger to use. Logger must be compatible with node-sap-logging API.
 * @returns {Promise}
 */
SecureConfigService.prototype.migrateAll = function (context) {
    var self = this;

    if (!this.initialized) {
        return this.initializing.then(function () {
            return self.migrateAll(context);
        });
    }
    var logger = getLogger(context);
    return new Promise(
        function (resolve, reject) {
            self.collection.find({ v: { $lt: self.v } }).toArray(function (err, results) {
                if (err) {
                    return reject(err);
                }
                if (Array.isArray(results) && (results.length)) {
                    resolve(results);
                }
                resolve(undefined);
            });
        })
        .then(function (results) {
            var promises;
            if (results) {
                logger.info('Migrating old secure configuration entries');
                promises = [];
                results.forEach(function (config) {
                    if (config._id !== HEADER_KEY) {
                        logger.debug('Migrating old secure configuration for key ' + config._id);
                        promises.push(migrateConfig(self, config, context));
                    }
                });
                return Promise.waitAll(promises)
                    .then(function () {
                        if (results.length === 100) {
                            // There might be some remaining entries
                            return self.migrateAll(context);
                        }
                    });
            }
        })
        .catch(function (err) {
            logAndThrow(logger, 'Failed to migrate some configuration old entries', err);
        });
};

