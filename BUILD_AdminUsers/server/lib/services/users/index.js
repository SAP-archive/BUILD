'use strict';
var Promise = require('norman-promise');
var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('user-service');
var auditService;
var userService;
var NormanError = commonServer.NormanError;

function AdminUsersService() {
}

module.exports = AdminUsersService;

AdminUsersService.prototype.initialize = function (done) {
	done();
};

AdminUsersService.prototype.onInitialized = function (done) {
	userService = commonServer.registry.getModule('UserService');
    auditService = commonServer.registry.getModule('AuditService');
    this.scanDeletedUsers().then(this.scanGlobalRoleChangeUsers);
    done();
};

AdminUsersService.prototype.shutdown = function (done) {
	done();
};

/**
 * Set a role for a user.
 *
 * @param {string} userId The user ID whose role has to be set.
 * @param {string} role The role to set, can be one of: 'standard', 'admin', 'guest'.
 * @returns {Promise}
 */
AdminUsersService.prototype.setRole = function (userId, role, context) {
    serviceLogger.debug('>> setRole');
    return userService.setRole(userId, role, context);
};

/**
 * Get all the users.
 * @param fields Object with a name and email property, or null.
 * @param options Object the mongodb properties (skip, top, limit...)
 * @returns {Promise}
 */
AdminUsersService.prototype.getUsers = function (fields, options) {
    serviceLogger.debug('>> getUsers');
    return userService.getUsers(fields, options);
};

/**
 *  scan for users with deleted property on. Trigger the cleaning method for each of them
 */
AdminUsersService.prototype.scanDeletedUsers = function () {
    serviceLogger.debug('>> scanDeletedUsers');
    return userService.listDeleted()
			.then(function (users) {
				if (users && users.length > 0) {
					users.forEach(function (user) {
						serviceLogger.info('found deleted user, restart cleaning process for ' + user._id);
                        auditService.logSystemEvent('Cleanup', 'System Event', 'Restart deleting user', user._id);
						userService.delete(user._id);
					});
				}
			})
			.catch(function (err) {
				serviceLogger.error(err, 'Failed to retrieve deleted users');
			});
};
/**
 *  scan for users with globalRoleChange property not empty. Trigger the cleaning method for each of them
 */
AdminUsersService.prototype.scanGlobalRoleChangeUsers = function () {
    serviceLogger.debug('>> scanGlobalRoleChangeUsers');
    var systemContext = {
        ip: '::1',
        user: {
            _id: '0',
            name: 'SYSTEM'
        }
    };
    return userService.listGlobalRoleChange()
        .then(function (users) {
            if (users && users.length > 0) {
                users.forEach(function (user) {
                    serviceLogger.info('found global role change of user, restart cleaning process for ' + user._id);
                    userService.changeGlobalRole(user._id, user.globalRoleChange, systemContext);
               });
            }
        })
        .catch(function (err) {
            serviceLogger.error(err, 'Failed to retrieve global role change of users');
        });
};

/**
 *  scan for users with deleted property on. Trigger the cleaning method for each of them
 */
AdminUsersService.prototype.delete = function (req) {
    serviceLogger.debug('>> delete');
    return new Promise(function (resolve, reject) {
		try {
			userService.delete(req.params.id, req.context)
					.then(function (user) {
						if (!user) {
							reject(new NormanError('Unable to find user'));
						}
						else {
							resolve(user);
						}
					});
		}
		catch (err) {
			reject(err);
		}
	});
};

AdminUsersService.prototype.listGlobalRoleChange = function (req) {
    serviceLogger.debug('>> listGlobalRoleChange');
    return new Promise(function (resolve, reject) {
        try {
            userService.listGlobalRoleChange(req.params.id, req.context)
                .then(function (user) {
                    if (!user) {
                        reject(new NormanError('Unable to find user'));
                    }
                    else {
                        resolve(user);
                    }
                });
        }
        catch (err) {
            reject(err);
        }
    });
};
