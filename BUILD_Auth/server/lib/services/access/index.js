'use strict';

var util = require('util');
var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('access-service');
var model = require('./model');
var registry = commonServer.registry;
var auditService;
var userService;
var optOutService;

var accessRules;
var NormanError = commonServer.NormanError;

var DEFAULT_ADDRESS = '*';
var selfRegistrationScopeName = 'access';
var topRole = 'standard';

var ADDRESS_TYPE = {
    DEFAULT: 0,
    DOMAIN: 1,
    NAME: 2
};

function AccessService() {
}

module.exports = AccessService;

/**
 * Initialize
 * @param {function} done
 */
AccessService.prototype.initialize = function (done) {
    serviceLogger.info('initialize');
    accessRules = model.create();
    if (done) {
        done();
    }
};

/**
 * onInitialized
 * @param {function} done
 */
AccessService.prototype.onInitialized = function (done) {
    serviceLogger.info('onInitialized');
    auditService = registry.getModule('AuditService');
    userService = registry.getModule('UserService');
    optOutService = registry.getModule('OptOutService');
    if (done) {
        done();
    }
};

/**
 * initializeSchema
 * @param {function} done
 */
AccessService.prototype.initializeSchema = function (done) {
    serviceLogger.info('initializeSchema');
    var self = this;
    var defaultAccess = {_id: DEFAULT_ADDRESS, scope: []};
    var configAccess = commonServer.config.get('access');
    var context = {
        ip: '::1',
        user: {
            _id: '0',
            name: 'SYSTEM'
        }
    };
    // Build default access rule based on the settings
    if (configAccess) {
        serviceLogger.info(configAccess, 'initialize default rules with');
        if (configAccess.defaultDomain) {
            defaultAccess._id = configAccess.defaultDomain;
        }
        if (configAccess.defaultPermissions && Array.isArray(configAccess.defaultPermissions)) {
            configAccess.defaultPermissions.forEach(function (defaultPermission) {
                var name = Object.keys(defaultPermission)[0];
                if (defaultPermission[name]) {
                    Array.isArray(defaultPermission[name]) ?
                        defaultAccess.scope.push({name: name, permissions: defaultPermission[name]}) :
                        defaultAccess.scope.push({name: name, permissions: [defaultPermission[name]]});
                }
            });
        }
    }
    else {
        serviceLogger.warn('NO DEFAULT RULES FOUND - PLEASE CHECK SETTING \'access\' OF THE CONFIG FILE');
    }
    // Add or Update the default access rules
    self.set(defaultAccess, context).then(function (access) {
        serviceLogger.debug(access, 'Default access rules set');
        if (done) {
            done();
        }
    }).catch(function (err) {
        serviceLogger.error(err, 'Failed to create/update default access rule');
        if (done) {
            done(err);
        }
    });
};

/**
 * shutDown
 * @param {function} done
 */
AccessService.prototype.shutDown = function (done) {
    serviceLogger.info('shutDown');
    accessRules = null;
    model.destroy();
    if (done) {
        done();
    }
};

/**
 * Create an access rule
 * @param {object} newAccess The access rule to create
 * @param {object} context The request context
 * @returns {object} The access rule created
 */
AccessService.prototype.create = function (newAccess, context) {
    serviceLogger.info(newAccess, 'create');
    if (!newAccess || !newAccess._id) {
        serviceLogger.info(' create() finished with an error');
        return Promise.reject(new NormanError('Invalid Access Rule'));
    }
    return Promise.resolve(accessRules.create(newAccess))
        .then(function (access) {
            serviceLogger.info({access: access}, 'access created');
            auditService.logEvent('Access', 'Add Access Rule', 'Access Rule added', {
                mail: access._id
            }, context);
            return access;
       })
        .catch(function (err) {
            var error = new NormanError('Unable to create Access Rule', err);
            serviceLogger.error(error);
            throw error;
        });
};

/**
 * Delete an access rule
 * @param {string} accessId Id of the rule to delete
 * @returns {object} The access rule deleted
 */
AccessService.prototype.delete = function (accessId, context) {
    serviceLogger.info('delete');
    if (!accessId) {
        serviceLogger.info('delete() finished with an error');
        return Promise.reject(new NormanError('Invalid Access Rule'));
    }

    return Promise.resolve(accessRules.findByIdAndRemove(accessId).exec())
        .then(function (accessRule) {
            if (accessRule) {
                serviceLogger.info({access: accessId}, 'access deleted');
                auditService.logEvent('Access', 'Delete Access Rule', 'Access Rule deleted', {
                    mail: accessId
                }, context);
            }
            else {
                serviceLogger.info({access: accessId}, 'unknow access Id');
            }
            return accessId;
        })
        .catch(function (err) {
            var error = new NormanError('Unable to delete Access Rule', err);
            serviceLogger.error(error);
             throw error;
        });
};

/**
 * Update an access rule
 * @param {object} updatedAccessRule The access rule to update
 * @returns {object} The access rule updated
 */
AccessService.prototype.update = function (updatedAccessRule, context) {
    serviceLogger.info(updatedAccessRule, 'update');
    if (!updatedAccessRule || !updatedAccessRule._id) {
        serviceLogger.info('create() finished with an error');
        return Promise.reject(new NormanError('Invalid Access Rule'));
    }

    return Promise.resolve(accessRules.findOne({_id: updatedAccessRule._id}).exec())
        .then(function (accessRule) {

            util._extend(accessRule, updatedAccessRule);
            return Promise.objectInvoke(accessRule, 'save')
                .then(function () {
                    serviceLogger.info({access: accessRule._id}, 'access updated');
                    auditService.logEvent('Access', 'Update Access Rule', 'Access Rule updated', {
                        mail: accessRule._id
                    }, context);
                    return accessRule.toJSON();
                });
        })
        .catch(function (err) {
            var error = new NormanError('Unable to update Access Rule', err);
            serviceLogger.error(error);
            throw error;
        });
};

/**
 * Get an access rule from an ID
 * @param {string} accessId Id of the rule
 * @returns {object} The access rule
 */
AccessService.prototype.getAccessById = function (accessId) {
    serviceLogger.info('getAccessById' + accessId);
    if (!accessId) {
        serviceLogger.warn(' Missing access Id');
        return Promise.reject(new NormanError('Missing Access Id'));
    }

    return Promise.resolve(accessRules.findOne({_id: accessId}).lean().exec())
        .then(function (accessRule) {
            serviceLogger.info(accessRule);
            return accessRule;
        })
        .catch(function (err) {
            var error = new NormanError('Unable to get Access Rule by Id', err);
            serviceLogger.error(error);
            throw error;
        });
};

/**
* Set an access rule - if the rule doesn't exist it is created, otherwise updated
* @param {object} access The access rule to update
* @returns {object} The access rule updated
*/
AccessService.prototype.set = function (access, context) {
    serviceLogger.info(access, 'setAccess');
    var self = this;
    return Promise.resolve(self.getAccessById(access._id)
        .then(function (accessIn) {
            if (!accessIn) {
                return self.create(access, context);
            }
            else {
                return self.update(access, context);
            }
        }).catch(function (err) {
            var error = new NormanError('Failed to create/update default access rule', err);
            serviceLogger.error(error);
            throw error;
        }));
};

/**
 * Get access rules
 * @param {object} options
 * @returns {object} Array of access rules
 */
AccessService.prototype.get = function (options) {
    serviceLogger.info(options, 'get');
    options = options || {};
    options.sort = +options.sort || 1;
    options.skip = +options.skip || 0;
    options.top = +options.top || 100;

    var promises = [];
    var findParam = {};
    if (options.filter) {
        findParam = { _id: options.filter};
    }

    // Count of access rules
    promises.push(accessRules.count({}).exec());
    // retrieve all access rules requested
    promises.push(accessRules.find(findParam).skip(options.skip).limit(options.top).lean().exec());

    return Promise.all(promises)
        .then(function (values) {
            var count = values[0];
            var rules = values[1];
            return {nbTotalRules: count, accessRules: rules};
        })
        .catch(function (err) {
            var error = new NormanError('Unable to get Access Rule', err);
            serviceLogger.error(error);
            throw error;
        });
};

/**
 * Remove the expiration date of an access rule
 * @param {string} id Id of the rule
 * @returns {object} The access rule updated
 */
AccessService.prototype.removeExpirationDate = function (id, context) {
    serviceLogger.info('removeExpirationDate' + id);
    var self = this;
    return this.getAccessById(id)
        .then(function (accessRule) {
            if (accessRule && accessRule.proposed_at) {
                accessRule.proposed_at = null;
                return self.update(accessRule, context);
            }
        });
};


/**
 *  According to the permissions, the user email will be added to the access list with the necessary role
 *
 * @param id
 * @param scopeName
 * @param context
 * @returns {emailAddress, successfullyProvisioned, acceptNotification, failureReason)
 */
AccessService.prototype.inviteUser = function (id, scopeName, permissions, context) {
    serviceLogger.info('inviteUser' + id + ' / ' + scopeName + ' / ' + permissions);
    var self = this;
    var result = {emailAddress: id, successfullyProvisioned: false, acceptNotification: false};

    return this.getPermissions(id, selfRegistrationScopeName)
        .then(function (accessPermission) {          // ['standard'] or ['guest'] or nothing

            if (permissions && permissions.length > 0) {
                var role = self.getRoles(scopeName, permissions)[0];
                var updatedRule = {_id: id,
                    scope: [
                        {name: selfRegistrationScopeName, permissions: [role]}
                    ]};

                if (!accessPermission || accessPermission.length === 0) {
                    updatedRule.proposed_at = new Date();
                    return self.create(updatedRule, context)
                        .then(function () {
                            result.successfullyProvisioned = true;
                            return null;
                        })
                        .catch(function () {
                            serviceLogger.error('failed to create rule for ' + id);
                            throw {email: id, successfullyProvisioned: false, reason: 'Failed to create'};
                        });
                }

                if (accessPermission[0] !== role && accessPermission[0] !== topRole) {
                    return self.getAccessById(id)
                        .then(function (accessRule) {
                            if (accessRule) {
                                // If the user already exists without an expiration date, we don't set the expiration date
                                if (accessRule.proposed_at) {
                                    updatedRule.proposed_at = new Date();
                                }
                                return self.update(updatedRule, context)
                                    .then(function () {
                                        result.successfullyProvisioned = true;
                                        return role;
                                    })
                                    .catch(function () {
                                        serviceLogger.error('failed to update rule for ' + id);
                                        throw {email: id, successfullyProvisioned: false, reason: 'Failed to update'};
                                    });
                            }
                            updatedRule.proposed_at = new Date();
                            return self.create(updatedRule, context)
                                .then(function () {
                                    result.successfullyProvisioned = true;
                                    return role;
                                })
                                .catch(function () {
                                    serviceLogger.error('failed to create rule for ' + id);
                                    throw {email: id, successfullyProvisioned: false, reason: 'Failed to create'};
                                });
                        })
                        .catch(function () {
                            serviceLogger.error('failed to getAccess ' + id);
                            throw {email: id, successfullyProvisioned: false, reason: 'Failed to getAccessById'};
                        });
                }

                result.successfullyProvisioned = true;
            }
            return role;
        })
        .then(function (role) {
            // grant existing user with top role if necessary
            if (role === topRole) {
                userService.getUserByEmail(id)
                    .then(function (user) {
                        if (user) {
                            userService.setRole(id, topRole, context);
                        }
                    })
                    .catch(function () {
                        serviceLogger.error('failed to grant role for ' + id);
                        throw {email: id, successfullyProvisioned: false, reason: 'Failed to grant role'};
                    });
            }
        })
        .then(function () {
            return optOutService.isOptedOut(id, context)
                .then(function (value) {
                    result.acceptNotification = !value;

                    serviceLogger.info(result);
                    return result;
                });
        })
        .catch(function () {
            serviceLogger.error('failed to invite user ' + id);
            throw {email: id, successfullyProvisioned: false, reason: 'unexpected'};
        });
};

/**
 *  According to the permissions, the users email will be added to the access list with the necessary role
 *
 * @param ids
 * @param scopeName
 * @param context
 * @returns {Array} Array of {emailAddress, successfullyProvisioned)
 */
AccessService.prototype.inviteUsers = function (ids, scopeName, context) {
    serviceLogger.info('inviteUsers - addresses ' + ids + ' / ' + scopeName);
    var self = this;
    var allFailed = true;
    return this.getPermissionsList(ids, scopeName)
        .then(function (permissionsList) {
            var promises = [];
            ids.forEach(function (id) {
                var permissions = permissionsList[id];
                promises.push(self.inviteUser(id, scopeName, permissions, context));
            });
            return Promise.waitAll(promises).then(function (results) {
                serviceLogger.info(results);
                return results;
            })
                .catch(function (inviteErrors) {
                    var results = [];
                    if (inviteErrors && inviteErrors.detail) {
                        if (inviteErrors.detail.results) {
                            inviteErrors.detail.results.forEach(function (currResult, index) {
                                if (currResult) {
                                   results.push(currResult);
                                    allFailed = false;
                                }
                                else {
                                    results.push(inviteErrors.detail.errors[index]);
                                }
                            });
                        }
                    }

                    if (allFailed) {
                        // throw only if all invite failed
                        var error = new NormanError('Unable to invite users', inviteErrors);
                        throw error;
                    }
                });
        })
        .catch(function (err) {
            var error = new NormanError('Unable to invite users', err);
            serviceLogger.error(error);
            throw error;
        });
};

/**
 * Get the permissions linked to an array of address and a scopeName
 * @param {string} ids
 * @param {string} scopeName
 * @returns {object} address, permissions key values.
 */
AccessService.prototype.getPermissionsList = function (ids, scopeName) {
    serviceLogger.info('getPermissionsList ' + ids + ' / ' + scopeName);
    var result = {};
    var promises = [];
    var self = this;

    ids.forEach(function (id) {
        promises.push(self.getPermissions(id, scopeName)
            .then(function (permissions) {
                return {_id: id, permissions: permissions};
            })
            .catch(function () {
                return {_id: id, permissions: []};
            })
        );
    });

    return Promise.all(promises)
        .then(function (values) {
            values.forEach(function (currPermissions) {
                result[currPermissions._id] = currPermissions.permissions;
            });
            return result;
        });
};

/**
 * Get the permissions linked to an address and a scopeName
 * Lookup first the address, then the domain, then the default
 * @param {string} id
 * @param {string} scopeName
 * @returns {Array} roles
 */
AccessService.prototype.getPermissions = function (id, scopeName) {
    serviceLogger.info('getPermissions ' + id + ' / ' + scopeName);
    var self = this;

    return Promise.resolve(accessRules.findOne({_id: id}).exec())
        .then(function (access) {
            var results = [];
            if (!access) {
                var address = self.parseID(id);
                if (address.type === ADDRESS_TYPE.NAME) {
                    return self.getPermissions(address.domain, scopeName).then(function (permissions) {
                        return permissions;
                    });
                }
                if (address.type === ADDRESS_TYPE.DOMAIN) {
                    return self.getPermissions(self.getDefaultDomainID(), scopeName).then(function (permissions) {
                        return permissions;
                    });
                }
                serviceLogger.info('Nb permissions: ' + results.length);
                return results;
            }

            access.scope.forEach(function (scope) {
                if (scope.name === scopeName) {
                    results = scope.permissions;
                }
            });

            // when address type is name (user email), then we have to look from domain for permissions
            if (results.length === 0) {
                address = self.parseID(id);
                if (address.type === ADDRESS_TYPE.NAME) {
                    return self.getPermissions(address.domain, scopeName).then(function (permissions) {
                        return permissions;
                    });
                }
            }


            serviceLogger.info('Nb permissions: ' + results.length);
            return results;
        })
        .catch(function (err) {
            serviceLogger.warn(err, 'Failed to get permissions');
            throw err;
        });

};

/**
 * Get the default domain ID
 * @returns {string}
 */
AccessService.prototype.getDefaultDomainID = function () {
    return DEFAULT_ADDRESS;
};

/**
 * Parse an address and return the name, the domain and the type
 * @param {string} id
 * @returns {object} {name, address, type}
 */
AccessService.prototype.parseID = function (id) {
    var address = id || '';
    if (id === this.getDefaultDomainID()) {
        return { name: '', domain: id, type: ADDRESS_TYPE.DEFAULT};
    }
    if (address.lastIndexOf('@') !== -1) {
        var aAddress = address.split('@');
        if (aAddress.length === 2 && aAddress[0].length > 0) {
            return { name: aAddress[0], domain: '@' + aAddress[1], type: ADDRESS_TYPE.NAME};
        }
        return { name: '', domain: '@' + aAddress[aAddress.length - 1], type: ADDRESS_TYPE.DOMAIN};
    }
    // address should have a @ otherwise it is an error => throw
    return { name: '', domain: '@' + address, type: ADDRESS_TYPE.DOMAIN};
};

/**
 * Get the roles associated to a scope and permissions
 * @param {string} scopeName
 * @param {Array} permissions
 * @returns {Array}
 */
AccessService.prototype.getRoles = function (scopeName, permissions) {
    serviceLogger.info('getRoles ' + scopeName + ' / ' + permissions);
    var roles = [];
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
        return roles;
    }
    var scopes = commonServer.config.get('security').scopes;
    if (scopes && Array.isArray(scopes)) {
        scopes.forEach(function (scope) {
            if (scope.name === scopeName) {
                permissions.forEach(function (permission) {
                    if (scope.permissions && scope.permissions.hasOwnProperty(permission)) {
                        roles = roles.concat(scope.permissions[permission]);
                    }
                });
            }
        });
    }
    return roles;
};
