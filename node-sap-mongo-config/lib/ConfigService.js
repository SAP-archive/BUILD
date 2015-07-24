'use strict';
require('node-sap-promise');

var defaultOptions = require('./options.js');
var utils = require('./utils');
var logAndThrow = utils.logAndThrow;

function getLogger(context) {
    return (context && context.logger) || ConfigService.defaultLogger;
}
function getAudit(context) {
    return (context && context.audit) || ConfigService.defaultAudit;
}

/**
 * @constructor
 */
function ConfigService() {
}
module.exports = ConfigService;

ConfigService.defaultCollection = defaultOptions.configCollection;
ConfigService.defaultLogger = defaultOptions.logger;
ConfigService.defaultAudit = defaultOptions.audit;

/**
 * Creates and initializes an instance of Configuration service.
 * @param {mongodb.Db} db Mongo DB connection
 * @param {object} [options] configuration parameters
 * @param {string} [options.collection] Config collection name, default to ConfigService.defaultCollection ('config' initially)
 * @param {object} [options.mongo] Mongo collection options
 * @param {object} [context] Context information
 * @param {Logger} [context.logger] Context logger to use. Logger must be compatible with node-sap-logging API.
 * @returns {ConfigService} initializing service instance
 */
ConfigService.create = function (db, options, context) {
    var logger;
    if (typeof db !== 'object') {
        throw new TypeError('Missing mandatory db parameter');
    }
    if (typeof options === 'object') {
        if (!options.collection && !options.mongo) {
            context = options;
            options = undefined;
        }
    }
    logger = getLogger(context);
    logger.debug('Initializing configuration service');
    options = options || {};
    var service = new ConfigService();
    service.name = options.collection || ConfigService.defaultCollection;
    service.db = db;
    service.initializing = Promise.invoke(db, 'collection', service.name, options.mongo)
        .then(function (collection) {
            service.collection = collection;
            logger.info('Configuration service initialized');
        })
        .catch(function (err) {
            logAndThrow(ConfigService.defaultLogger, 'Failed to initialize configuration service', err);
        });
    return service;
};

/**
 * Retrieves a configuration entry
 * @param {string} key Configuration entry _id
 * @param {object} [context] Context information
 * @param {Logger} [context.logger] Context logger to use. Logger must be compatible with node-sap-logging API.
 * @returns {Promise} Promise eventually resolved to the configuration entry (an object with _id and value properties) or null if the entry is missing
 */
ConfigService.prototype.getConfig = function (key, context) {
    var logger, self = this;
    if (!this.collection) {
        return this.initializing.then(function () {
            return self.getConfig(key, context);
        });
    }
    logger = getLogger(context);
    return Promise.invoke(this.collection, 'findOne', {_id: key})
        .then(function (config) {
            if (!config) {
                logger.debug('Secure configuration not found for key:' + key);
                return null;
            }
            logger.debug({config: config}, 'Configuration read for key:' + key);
            return config;
        })
        .catch(function (err) {
            logAndThrow(logger, 'Failed to retrieve configuration entry for key: ' + key, err);
        });
};

/**
 * Retrieves a configuration value
 * @param {string} key Configuration entry _id
 * @param {object} [context] Context information
 * @param {Logger} [context.logger] Context logger to use. Logger must be compatible with node-sap-logging API.
 * @returns {Promise} Promise eventually resolved to the configuration value or undefined if the entry is missing
 */
ConfigService.prototype.get = function (key, context) {
    return this.getConfig(key, context)
        .then(function (config) {
            var configValue = (config ? config.value : undefined);
            return configValue;
        });
};

/**
 * Sets a configuration value
 * @param {string} key Configuration entry _id
 * @param {*} [value] Configuration entry value
 * @param {object} [context] Context information
 * @param {Logger} [context.logger] Context logger to use. Logger must be compatible with node-sap-logging API.
 * @param {function} [context.audit] Context audit function to use. Audit function must have the following signature audit(auditData, context) and return a Promise. auditData has the action, key, value and oldValue properties
 * @returns {Promise} Promise eventually resolved to the old configuration entry or undefined if the entry was missing
 */
ConfigService.prototype.set = function (key, value, context) {
    var self = this;
    if (!this.collection) {
        return this.initializing.then(function () {
            return self.set(key, value, context);
        });
    }
    var logger = getLogger(context), audit = getAudit(context);
    var update = { $set: {value: value} };
    var options = {
        upsert: true,
        new: false  // return old version of document for audit
    };
    var auditData = {
        key: key,
        value: value
    };

    return new Promise(
        function (resolve, reject) {
            self.collection.findAndModify({_id: key}, [['_id', 1]], update, options, function (err, result) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        })
        .then(function (oldConfig) {
            var created = !oldConfig || !oldConfig._id;
            if (created) {
                oldConfig = null;
                logger.info({config: auditData}, 'Configuration created for key: ' + key);
                auditData.action = 'insert';
            }
            else {
                auditData.oldValue = oldConfig.value;
                logger.info({ config: auditData }, 'Configuration updated for key: ' + key);
                auditData.action = 'update';
            }
            if (audit) {
                return Promise.resolve(audit(auditData, context))
                    .then(function () {
                        return oldConfig;
                    });
            }
            return oldConfig;
        })
        .catch(function (err) {
            logAndThrow(logger, 'Failed to update configuration for key: ' + key, err);
        });
};

/**
 * Deletes a configuration entry
 * @param {string} key Configuration entry _id
 * @param {object} [context] Context information
 * @param {Logger} [context.logger] Context logger to use. Logger must be compatible with node-sap-logging API.
 * @param {function} [context.audit] Context audit function to use. Audit function must have the following signature audit(auditData, context) and return a Promise. auditData has the action, key and oldValue properties
 * @returns {Promise} Promise eventually resolved to the old configuration entry or undefined if the entry was missing
 */
ConfigService.prototype.delete = function (key, context) {
    var self = this;
    if (!this.collection) {
        return this.initializing.then(function () {
            return self.delete(key, context);
        });
    }
    var logger = getLogger(context), audit = getAudit(context), auditData = { key: key };
    return new Promise(
        function (resolve, reject) {
            self.collection.findAndRemove({_id: key}, [['_id', 1]], function (err, oldConfig) {
                if (err) {
                    return reject(err);
                }
                if (oldConfig && oldConfig._id !== key) {
                    oldConfig = null;
                }
                resolve(oldConfig);
            });
        })
        .then(function (oldConfig) {
            if (oldConfig) {
                auditData.oldValue = oldConfig.value;
                logger.info({ config: auditData }, 'Configuration deleted for key: ' + key);
                if (audit) {
                    auditData.action = 'delete';
                    return Promise.resolve(audit(auditData, context))
                        .then(function () {
                            return oldConfig;
                        });
                }
            }
            else {
                logger.info('Configuration not found for key: ' + key + ', ignoring delete');
            }
            return oldConfig;
        })
        .catch(function (err) {
            logAndThrow(logger, 'Failed to delete configuration for key: ' + key, err);
        });
};
