'use strict';

var commonServer = require('norman-common-server');
var _ = require('norman-server-tp')['lodash'];

var config = commonServer.config;

var MailUtil = require('../../utils/mailerUtils.js');
var utils = commonServer.utils;

var NormanError = commonServer.NormanError;

var certificateUtils = require('../../utils/certificateUtils');
var userModel = require('./user.model');
var User;
var serviceLogger = commonServer.logging.createLogger('user-service');

var registry = commonServer.registry;
var auditService;
var USER_FIELDS = 'name email provider has_email_verified avatar_url facebook google linkedin';
var aclService;
var accessService;

var MAX_LIST_COUNT = 200;

function UserService() {
    this.userGlobalChangeHandlers = [];
}
module.exports = UserService;

UserService.prototype.initialize = function (done) {
    User = userModel.create();
    done();
};

UserService.prototype.onInitialized = function (done) {
    auditService = registry.getModule('AuditService');
    aclService = registry.getModule('AclService');
    accessService = registry.getModule('AccessService');
    commonServer.logging.Logger.serializers.user = function (user) {
        user = user || {};
        return {
            _id: (user._id && user._id.toString()),
            principal: user.principal,
            provider: user.provider,
            name: user.name,
            email: user.email
        };
    };
    done();
};

UserService.prototype.checkSchema = function (done) {
    userModel.createIndexes(done);
};

UserService.prototype.shutdown = function (done) {
    userModel.destroy(done);
};

UserService.prototype.getModel = function () {
    serviceLogger.debug('get User model');
    if (!User) {
        User = userModel.create();
    }
    return User;
};

UserService.prototype.createX509User = function (context) {
    serviceLogger.info('Creating user from X509 certificate');
    if (context.auth) {
        var newUser = {
            principal: certificateUtils.getPrincipalName(context.auth.certificate),
            email: certificateUtils.getEmail(context.auth.certificate),
            name: certificateUtils.getName(context.auth.certificate),
            provider: context.auth.method
        };
        // no email verification is required as it already has been done by the SSO platform
        return this.rawCreateUser(newUser, null, context)
            .then(function (createdUser) {
                serviceLogger.info({user: newUser}, 'user created');
                auditService.logEvent('Authentication', 'sign up', 'sign up is successful', {
                    email: newUser.email,
                    name: newUser.name || ''
                }, context);
                return createdUser;
            })
            .catch(function (err) {
                serviceLogger.error(err, 'Failed to sso sign up');
                auditService.logEvent('Authentication', 'sign up failed', 'Unable to create user', {
                    email: newUser.email,
                    name: newUser.name || '',
                    error: err
                }, context);
                throw new NormanError('Failed to create user', err);
            });
    }
};

UserService.prototype.createUser = function (newUser, emailTemplateData, context) {
    return this.rawCreateUser(newUser, emailTemplateData, context)
        .then(function (createdUser) {
            serviceLogger.info({user: newUser}, 'user created');
            auditService.logEvent('Authentication', 'local sign up', 'sign up is successful', {
                email: newUser.email,
                name: newUser.name || ''
            }, context);
            return createdUser;
        })
        .catch(function (err) {
            serviceLogger.error(err, 'Failed to local sign up');
            auditService.logEvent('Authentication', 'Local sign up failed', 'Unable to create user', {
                email: newUser.email,
                name: newUser.name || '',
                error: err
            }, context);
            throw new NormanError('Failed to create user', err);
        });
};

function _setEmailVerificationToken(user) {
    var validityPeriod = config.get('account').emailVerifingTokenExpiryInDays || 30;
    user.email_verified_token = utils.token(64);
    user.email_verified_token_expired = new Date(Date.now() + validityPeriod * 86400 * 1000);
}

UserService.prototype.rawCreateUser = function (newUser, emailTemplateData, context) {
    if (newUser === undefined || newUser === null) {
        serviceLogger.info('createUser() finished with an error');
        return Promise.reject(new NormanError('cannot save empty user'));
    }

    if (!newUser.email || newUser.email.length === 0) {
        serviceLogger.info('createUser() finished with an error');
        return Promise.reject(new NormanError('cannot create user without email'));
    }

    var userEmail = newUser.email;
    //Get the access permissions
    return Promise.resolve(accessService.getPermissions(userEmail, 'access'))
        .then(function (permissions) {
            //Get the associated roles
            var roles = accessService.getRoles('access', permissions);
            var isAdmin = config.get('security') && config.get('security').application && config.get('security').application.admin === true;
            //Reject creation if no roles are defined for the user - except if the user is accessing to the admin console
            if (roles.length === 0 && !isAdmin) {
                var error = new NormanError({error: { code: 403, message: 'No access roles for ' + userEmail}});
                serviceLogger.warn(error);
                throw error;
            }
           //Set a temporary token for email verification
            _setEmailVerificationToken(newUser);
            //Create the user
            return User.create(newUser)
                .then(function (user) {
                    //Admin console - it's up to the new administrator to upgrade his/her role for BUILD (standard/guest)
                    if (roles.length === 0) {
                       return user;
                    }
                    //Grant the roles
                    return aclService.grantUserRole(user._id.toString(), roles, context)
                        .then(function () {
                            //Remove the dead line date in case the user was authorized via an invitation
                            return accessService.removeExpirationDate(userEmail, context);
                        })
                        .then(function () {
                             return user;
                        });
                }).then(function (user) {
                    //Send the confirmation email
                    if (emailTemplateData) {
                        MailUtil.sendTemplatedEmail({template: MailUtil.EmailTemplates.ACCOUNT_REGISTER, data: {
                            user: user,
                            info: emailTemplateData
                        }});
                    }
                    return user.toJSON();
                });
        })
        .catch(function (err) {
            var error = new NormanError('Unable to create user', err);
            serviceLogger.warn(error);
            throw error;
        });
};

UserService.prototype.createLocalAdmin = function (admin, context) {
    if (!admin || !admin.email) {
        serviceLogger.error('Cannot create local admin without email address');
        return Promise.reject(new NormanError('Cannot create local admin without email address'));
    }
    var adminUser = {
        principal: admin.email,
        name: admin.name,
        email: admin.email,
        password: admin.password,
        provider: 'local'
    };

    serviceLogger.info('Creating local admin ' + admin.email);
    return this.getUserByEmail(adminUser.email)
        .then(function (existingUser) {
            if (!existingUser) {
                return Promise.resolve(User.create(adminUser))
                    .then(function (createdUser) {
                        var message = 'Create user';
                        var description = 'User ' + createdUser.email + ' created';
                        var auditData = {
                            id: createdUser._id.toString(),
                            principal: createdUser.principal,
                            name: createdUser.name,
                            email: createdUser.email,
                            provider: createdUser.provider
                        };
                        serviceLogger.info({ user: auditData }, description);
                        auditService.logSystemEvent('Authentication', message, description, auditData, context);
                        adminUser = createdUser;
                        return adminUser;
                    });
            }
            adminUser = existingUser;
            return adminUser;
        })
        .then(function (user) {
            return aclService.grantAdminRole(user, context);
        })
        .then(function () {
            serviceLogger.info('Admin role granted to ' + adminUser.email);
            return adminUser;
        })
        .catch(function (err) {
            var normanError = new NormanError('Failed to create admin user ' + adminUser.email, err);
            serviceLogger.error(normanError);
            throw normanError;
        });
};

UserService.prototype.createAdminUser = UserService.prototype.createLocalAdmin;


/**
 *  Gets User with id
 * @param id
 */
UserService.prototype.getUserById = function (id) {
    var deferred = Promise.defer();

    User.findOne({
            _id: id,
            deleted: false
        }, 'name email provider has_email_verified avatar_url preferences',
        function (error, user) { // don't ever give out the password or salt
            if (error) {
                serviceLogger.error(new NormanError('Unable to get user by id', error));
                deferred.reject(new NormanError('Unable to get user by id', error));
            }

            deferred.resolve(user);
        });

    return deferred.promise;
};

UserService.prototype.getUserPrincipal = function (id) {
    return Promise.resolve(User.findOne({_id: id}, 'name email provider has_email_verified acl_roles').exec())
        .then(function (user) {
            if (!user) {
                serviceLogger.warn('Unknown user ' + id);
                return null;
            }
            return user.toJSON();
        })
        .catch(function (err) {
            serviceLogger.warn(err, 'Failed to load user ' + id);
            throw err;
        });
};

UserService.prototype.list = function () {
    var deferred = Promise.defer();

    User.find({deleted: false}, '-login_attempts -lock_until -password -salt -iterationCount -email_verified_token -email_verified_token_expired ' +
            '-has_email_verified -has_deactivated -invitation_token -invitation_expired -stats ',
        function (error, users) {
            if (error) {
                serviceLogger.error(new NormanError('unable to list users', error));
                deferred.reject(new NormanError('unable to list users', error));
            }

            serviceLogger.info('list(), finished successfully');
            deferred.resolve(users);
        });

    return deferred.promise;
};

UserService.prototype.listDeleted = function () {
    serviceLogger.debug('>> listDeleted');
    var deferred = Promise.defer();

    User.find({deleted: true}, 'name email',
        function (error, users) {
            if (error) {
                serviceLogger.error(new NormanError('unable to list deleted users', error));
                deferred.reject(new NormanError('unable to list deleted users', error));
            }

            serviceLogger.info('listDeleted(), finished successfully');
            deferred.resolve(users);
        });

    return deferred.promise;
};

UserService.prototype.listGlobalRoleChange = function () {
    serviceLogger.debug('>> listGlobalRoleChange');
    var deferred = Promise.defer();

    User.find({globalRoleChange: {$ne: null}}, 'name globalRoleChange email',
        function (error, users) {
            if (error) {
                serviceLogger.error(new NormanError('unable to list users with global role change ', error));
                deferred.reject(new NormanError('unable to list users with global role change', error));
            }

            serviceLogger.debug('listGlobalRoleChange(), finished successfully');
            deferred.resolve(users);
        });

    return deferred.promise;
};

UserService.prototype.verifyEmail = function (emailToken, emailTemplateData, context) {
    // Check that the token was previously set for the current user
    return Promise.resolve(User.findOne({
        _id: context.user._id,
        email_verified_token: emailToken,
        deleted: false
    }).exec())
        .then(function (user) {
            var now = new Date();

            // user and token do not match
            if (!user) {
                return {
                    status: 'invalid',
                    message: 'Invalid token'
                };
            }

            // email has already been verified, no more check is required
            if (user.has_email_verified) {
                serviceLogger.info('verifyEmail(), finished successfully: email has already been verified');
                return {
                    status: 'unavailable',
                    message: config.get('account').emailHasAlreadyVerified
                };
            }

            // verification email has expired, resent it
            if (user.email_verified_token_expired < now) {
                //Set a temporary token for email verification
                _setEmailVerificationToken(user);
                return new Promise(function (resolve, reject) {
                    user.save(function (err, savedUser) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(savedUser);
                        }
                    });
                })
                    .then(function (savedUser) {
                        MailUtil.sendTemplatedEmail({template: MailUtil.EmailTemplates.ACCOUNT_REGISTER, data: {
                            user: savedUser,
                            info: emailTemplateData
                        }});
                        return {
                            status: 'expired',
                            message: config.get('account').recoverAccountPasswordTokenExpiredMessage
                        };
                    })
                    .catch(function (err) {
                        var error = new NormanError(err);
                        serviceLogger.warn(error);
                        auditService.logEvent('Authentication', 'Email verification failed', 'Unable to verify user email', {
                            emailToken: emailToken,
                            error: error
                        }, context);
                        throw error;
                    });
            }

            // update the email verified setting
            user.has_email_verified = true;
            return new Promise(function (resolve, reject) {
                user.save(function (err, savedUser) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(savedUser);
                    }
                });
            })
                .then(function (savedUser) {
                    serviceLogger.info('verifyEmail(), finished successfully');
                    auditService.logEvent('Authentication', 'Email verification', 'Verify user email successfully', {emailToken: emailToken}, context);
                    return {
                        name: savedUser.name,
                        email: savedUser.email,
                        status: 'success',
                        message: config.get('account').recoverAccountPasswordTokenVerifiedMessage
                    };
                })
                .catch(function (err) {
                    var error = new NormanError(err);
                    serviceLogger.warn(error);
                    throw error;
                });
        })
        .catch(function (err) {
            var error = new NormanError('Unable to verify email', err);
            serviceLogger.error(err);
            auditService.logEvent('Authentication', 'Email verification failed', 'Unable to verify user email', {
                emailToken: emailToken,
                error: error
            }, context);
            throw error;
        });
};

UserService.prototype.resetPasswordTokenValidation = function (token) {
    var deferred = Promise.defer();
    User.findOne({
            request_password_token: token,
            deleted: false
        },
        function (err, user) {

            if (err) {
                serviceLogger.error(new NormanError(err));
                deferred.reject(new NormanError(err));
            }

            // no user for this token
            if (!user) {
                deferred.resolve({
                    status: 'invalid',
                    message: 'Invalid token'
                });
            }
            else {
                if (user.request_password_token_expired < Date.now()) {
                    // token has been expired
                    // @Todo Audit Log
                    serviceLogger.info('resetPasswordTokenValidation(), finished successfully');
                    deferred.resolve({
                        status: 'expired',
                        message: config.get('account').recoverAccountPasswordTokenExpiredMessage
                    });
                }
                else {
                    // update token so cannot used again
                    user.save(function (err2) {
                        if (err2) {
                            serviceLogger.error(new NormanError(err2));
                            deferred.reject(new NormanError(err2));
                        }
                        // @Todo Audit Log
                        serviceLogger.info('resetPasswordTokenValidation(), finished successfully');
                        deferred.resolve({
                            status: 'verified',
                            name: user.name,
                            email: user.email,
                            message: config.get('account').recoverAccountPasswordTokenVerifiedMessage
                        });
                    });
                }
            }
        });

    return deferred.promise;
};

UserService.prototype.requestPwd = function (email, req) {
    return Promise.resolve(User.findOne({
        email: email,
        deleted: false
    }).exec())
        .then(function (user) {
            // Requested email is not a user's email
            if (!user) {
                auditService.logSystemEvent('Authentication', 'Reset Password', 'Request Reset Password of unregistered email', {
                    email: email
                });
                return Promise.resolve(user);
            }
            // Set a token to identify the password to reset
            var now = new Date();
            user.request_password_token = utils.token(64);
            user.request_password_token_expired = now.setDate(now.getDate() + config.get('account').forgotPasswordTokenExpiryInDays);
            return Promise.objectInvoke(user, 'save')
                .then(function () {
                    auditService.logSystemEvent('Authentication', 'Reset Password', 'Request Reset Password is successful', {
                        email: email,
                        request_password_token: user.request_password_token,
                        request_password_token_expired: user.request_password_token_expired
                    });

                    // Send the resetting instruction to the user
                    MailUtil.sendTemplatedEmail({template: MailUtil.EmailTemplates.PWD_REQUEST, data: {
                        user: user,
                        req: req
                    }});

                    return user;
                })
                .catch(function (err) {
                    var error = new NormanError('Request Reset Password failed', err);
                    serviceLogger.error(err);
                    auditService.logSystemEvent('Authentication', 'Reset Password', 'Request Reset Password failed', {
                        emailToken: email,
                        error: error
                    });
                    throw error;
                });
        })
        .catch(function (err) {
            var error = new NormanError('Request Reset Password failed', err);
            serviceLogger.error(err);
            auditService.logSystemEvent('Authentication', 'Reset Password', 'Request Reset Password failed', {
                emailToken: email,
                error: error
            });
            throw error;
        });
};

UserService.prototype.resendVerificationEmail = function (email, emailTemplateData) {
    var deferred = Promise.defer();
    User.findOne({
        email: email,
        deleted: false
    }, function (err, user) {
        if (err) {
            serviceLogger.error(new NormanError(err));
            return deferred.reject(new NormanError(err));
        }

        var now = new Date();
        user.email_verified_token = utils.token(64);
        user.email_verified_token_expired = now.setDate(now.getDate() + config.get('account').emailVerifingTokenExpiryInDays);
        user.save(function (err2) {
            if (err2) {
                serviceLogger.error(new NormanError(err2));
                return deferred.reject(new NormanError(err2));
            }
            // Send Registration email to user
            MailUtil.sendTemplatedEmail({template: MailUtil.EmailTemplates.ACCOUNT_REGISTER, data: {
                user: user,
                info: emailTemplateData
            }});
        });
        deferred.resolve(user);
    });
    return deferred.promise;
};

UserService.prototype.resetPassword = function (token, newPass, req) {

    return Promise.resolve(User.findOne({
        request_password_token: token,
        deleted: false
    }).exec())
        .then(function (user) {
            if (user.request_password_token_expired < Date.now()) {
                throw new NormanError('Password reset token expired');
            }

            if (_.size(user.password_history) >= 5) {
                user.password_history.splice(0, 1);
            }
            // for audit log
            var changes = {};
            changes.toke = token;
            changes.old_salt = user.salt;
            changes.old_iterationCount = user.iterationCount;

            user.password_history.push({
                salt: user.salt,
                iterationCount: user.iterationCount,
                password: user.password,
                updated_at: new Date()
            });

            user.password = newPass;
            user.request_password_token = null;
            user.request_password_token_expired = null;
            user.updated_at = Date.now();

            return new Promise(function (resolve, reject) {
                user.save(function (err, savedUser) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(savedUser);
                    }
                });
            })
                .then(function (savedUser) {
                    // for audit log
                    changes.new_salt = savedUser.salt;
                    changes.new_iterationCount = savedUser.iterationCount;

                    // audit log
                    auditService.logEvent('Authentication', 'Reset Password', 'Reset Password is successful', changes, req.context);

                    // Send password changed email
                    MailUtil.sendTemplatedEmail({template: MailUtil.EmailTemplates.PWD_RESET, data: {
                        user: savedUser,
                        req: req,
                        date_changed: new Date()
                    }});

                    return savedUser;
                });
        })
        .catch(function (err) {
            var error = new NormanError(err);
            serviceLogger.error(error);
            auditService.logEvent('Authentication', 'Reset Password failed', 'Reset Password failed', {
                toke: token,
                error: err
            }, req.context);
            throw error;
        });
};

UserService.prototype.show = function (userId) {
    var deferred = Promise.defer();
    User.findById(userId, USER_FIELDS, function (err, user) {
        if (err || user.deleted) {
            serviceLogger.error(new NormanError(err));
            return deferred.reject(new NormanError(err));
        }
        deferred.resolve(user);
    });
    return deferred.promise;
};

UserService.prototype.showAvatarList = function (userList) {
    var deferred = Promise.defer();
    User.find({
        _id: {
            $in: userList
        },
        deleted: false
    })
        .select('_id name avatar_url email')
        .lean()
        .exec(function (err, users) {
            if (err) {
                serviceLogger.error(new NormanError(err));
                return deferred.reject(new NormanError(err));
            }
            deferred.resolve(users);
        });
    return deferred.promise;
};

UserService.prototype.destroy = function (userId) {
    var deferred = Promise.defer();
    User.findByIdAndRemove(userId, function (err) {
        if (err) {
            serviceLogger.error(new NormanError(err));
            return deferred.reject(new NormanError(err));
        }
        return deferred.resolve(userId);
    });
    return deferred.promise;
};

UserService.prototype.changePassword = function (userId, oldPass, newPass, req) {
    var deferred = Promise.defer();
    User.findById(userId, function (err, user) {

        if (err || user.deleted) {
            serviceLogger.error(new NormanError(err));
            auditService.logEvent('Authentication', 'Change Password failed', 'Change Password failed', null, req.context);
            return deferred.reject(new NormanError(err));
        }

        User.getAuthenticated(user.principal, oldPass, function (error, user, reason) {

            if (error) {
                serviceLogger.error(new NormanError(error));
                return deferred.reject(error);
            }

            if (reason) {
                var reasons = User.failedLogin,
                    msg = {};

                // real reason: email is not registered.
                msg[reasons.NOT_FOUND] = {
                    errors: {password: {message: config.get('security').failedLoginReasons.notFound}},
                    name: 'notAuthorized'
                };
                // The email or password you entered is incorrect. Please try again.
                msg[reasons.PASSWORD_INCORRECT] =
                {
                    errors: {
                        password: {
                            message: 'The Password you supplied is not correct'
                        }
                    }, name: 'notAuthorized'
                };
                // notify user that account is temporarily locked by email with unlock instructions
                msg[reasons.MAX_ATTEMPTS] =
                {
                    errors: {password: {message: config.get('security').failedLoginReasons.maxAttempts}},
                    name: 'notAuthorized'
                };

                serviceLogger.error(msg[reason], 'Failed to authenticate user');
                return deferred.reject(msg[reason]);
            }
            if (_.size(user.password_history) >= 5) {
                user.password_history.splice(0, 1);
            }

            // for audit log
            var changes = {};
            changes.old_salt = user.salt;
            changes.old_iterationCount = user.iterationCount;
            user.password_history.push({
                salt: user.salt,
                iterationCount: user.iterationCount,
                password: user.password,
                updated_at: new Date()
            });
            user.password = newPass;
            user.save(function (err2) {
                if (err2) {
                    serviceLogger.error(new NormanError(err2));
                    auditService.logEvent('Authentication', 'Change Password failed', 'Change Password failed', {error: err}, req.context);
                    if (err2.name === 'ValidationError') {
                        if (err2.errors.password) {
                            delete err2.errors.password.value;
                            err2.errors.password.message = 'New Password is not Validate';
                            err2.errors.password.path = 'newPassword';
                        }
                    }
                    return deferred.reject(err2);
                }

                // for audit log
                changes.new_salt = user.salt;
                changes.new_iterationCount = user.iterationCount;

                // audit log
                auditService.logEvent('Authentication', 'Change Password', 'Change Password is successful', changes, req.context);

                // Send password changed email
                MailUtil.sendTemplatedEmail({template: MailUtil.EmailTemplates.PWD_CHANGE, data: {
                    user: user,
                    req: req,
                    date_changed: new Date()
                }});

                deferred.resolve(user);
            });
        }, req.context);
    });

    return deferred.promise;

};

UserService.prototype.changeAvatar = function (userId, avatar, fileType, reqContext) {
    var deferred = Promise.defer();
    var base64Image = new Buffer(avatar.buffer, 'binary').toString('base64');
    User.findById(userId, function (err, user) {
        if (err || user.deleted) {
            serviceLogger.error(new NormanError(err));
            auditService.logEvent('Personal Data', 'Change Picture', 'Change Picture failed', {error: err}, reqContext);
            return deferred.reject(new NormanError(err));
        }

        user.avatar_content_type = fileType;
        user.avatar_bin = base64Image;
        user.avatar_url = '/api/users/' + user._id + '/avatar';
        user.avatar_last_modified = Date.now();
        user.updatedAt = Date.now();

        user.save(function (err2) {
            if (err2) {
                serviceLogger.error(new NormanError(err2));
                auditService.logEvent('Personal Data', 'Change Picture', 'Change Picture failed', {error: err2}, reqContext);
                return deferred.reject(new NormanError(err2));
            }
            auditService.logEvent('Personal Data', 'Change Picture', 'Change Picture is successful', {}, reqContext);
            deferred.resolve(user);
        });

    });
    return deferred.promise;
};

UserService.prototype.removeAvatar = function (userId, reqContext) {
    var deferred = Promise.defer();
    User.findById(userId, function (err, user) {
        if (err || user.deleted) {
            auditService.logEvent('Personal Data', 'Remove Picture', 'Remove Picture failed', {error: err}, reqContext);
            serviceLogger.error(new NormanError(err));
            return deferred.reject(new NormanError(err));
        }

        user.avatar_content_type = null;
        user.avatar_bin = null;
        user.avatar_url = null;
        user.avatar_last_modified = Date.now();
        user.updatedAt = Date.now();

        user.save(function (err2) {
            if (err2) {
                serviceLogger.error(new NormanError(err2));
                auditService.logEvent('Personal Data', 'Remove Picture', 'Remove Picture failed', {error: err2}, reqContext);
                return deferred.reject(new NormanError(err2));
            }
            auditService.logEvent('Personal Data', 'Remove Picture', 'Remove Picture is successful', {}, reqContext);
            deferred.resolve(user);
        });

    });
    return deferred.promise;
};

UserService.prototype.updateProfile = function (userId, newUser, context) {
    var deferred = Promise.defer();
    User.findById(userId, function (err, user) {
        if (err || user.deleted) {
            serviceLogger.error(new NormanError(err));
            auditService.logEvent('Authentication', 'Update Profile Failed', 'Update Profile Failed', {
                userId: userId,
                error: err
            }, context);
            return deferred.reject(new NormanError(err));
        }

        var changes = {};
        if (user.name !== newUser.name) {
            changes.old_name = user.name;
            changes.new_name = newUser.name;
            user.name = newUser.name;
        }
        if (user.email !== newUser.email) {
            user.has_email_verified = false;
            changes.old_email = user.email;
            changes.new_email = newUser.email;
            user.email = newUser.email;
            if (user.provider === 'local') {
                user.principal = newUser.email;
            }

            //Set a temporary token for email verification
            _setEmailVerificationToken(user);

            // Send the confirmation email
            var emailTemplateData = {
                url: context.request.protocol + '://' + context.request.host + '/verifyemail',
                email_verified_token: user.email_verified_token
            };
            MailUtil.sendTemplatedEmail({template: MailUtil.EmailTemplates.EMAIL_CHANGE, data: {
                user: user,
                info: emailTemplateData
            }});

        }

        user.updatedAt = Date.now();

        user.save(function (err2) {
            if (err2) {
                serviceLogger.error(new NormanError(err2));
                changes.error = err2;
                auditService.logEvent('Authentication', 'Update Profile Failed', 'Update Profile Failed', changes, context);
                return deferred.reject(err2);
            }
            auditService.logEvent('Authentication', 'Update Profile', 'Update Profile is successful', changes, context);
            deferred.resolve(user);
        });

    });
    return deferred.promise;
};

UserService.prototype.picture = function (userId) {
    var deferred = Promise.defer();
    User.findOne({
            _id: userId,
            deleted: false
        }, 'avatar_url avatar_bin provider avatar_content_type avatar_last_modified',
        function (err, user) { // don't ever give out the password or salt
            if (err) {
                serviceLogger.error(new NormanError(err));
                return deferred.reject(new NormanError(err));
            }

            deferred.resolve(user);
        });
    return deferred.promise;
};

/**
 *
 * @param email
 * @returns {Promise}
 */
UserService.prototype.getUserByEmail = function (email) {
    serviceLogger.info('GetUser', {email: email});
    return Promise.resolve(User.findOne({
        email: email,
        deleted: false
    }, USER_FIELDS).exec())
        .then(function (user) {
            if (user) {
                serviceLogger.debug({ user: user }, 'User found');
            }
            else {
                serviceLogger.debug('User not found');
            }
            return user;
        })
        .catch(function (err) {
            serviceLogger.error(err, 'Failed to retrieve user ' + email);
            throw new NormanError(err);
        });
};

UserService.prototype.GetUserByEmail = UserService.prototype.getUserByEmail;

/**
 *
 * @param principal
 * @returns {Promise}
 */
UserService.prototype.getUserByPrincipal = function (principal) {
    serviceLogger.info('GetUser', {principal: principal});
    return Promise.resolve(User.findOne({
        principal: principal,
        deleted: false
    }, USER_FIELDS).exec())
        .then(function (user) {
            if (!user) {
                serviceLogger.warn('Unknown user ' + principal);
                return null;
            }
            return user.toJSON();
        })
        .catch(function (err) {
            serviceLogger.error(err, 'Failed to retrieve User');
            throw new NormanError(err);
        });
};

/**
 *
 * @param query
 * {Promise}
 */
UserService.prototype.GetUser = function (query) {
    if (!_.isObject(query)) {
        serviceLogger.error(query, 'Invalid argument');
        throw new NormanError('Invalid argument');
    }
    // deleted flag
    if (_.isEmpty(query.deleted)) {
        query.deleted = false;
    }

    serviceLogger.info('GetUser', {query: query});
    return Promise.resolve(User.findOne(query, USER_FIELDS).exec())
        .then(function (user) {
            return user;
        })
        .catch(function (err) {
            serviceLogger.error(err, 'Failed to retrieve User');
            throw new NormanError(err);
        });
};

// Return a list of users with only the useful fields
function extractUsers(docs) {
    var res = [];
    docs.forEach(function (item) {
        var entry = {
            id: item._id,
            name: item.name,
            email: item.email,
            avatar_url: item.avatar_url
        };
        res.push(entry);
    });
    return res;
}

// Only keep the useful roles
function cleanRoles(roles) {
    var res = [];
    roles.forEach(function (item) {
        if (item === 'standard' || item === 'guest' || item === 'admin') {
            res.push(item);
        }
    });
    return res;
}

// Return a list of users with only the useful fields and their ACL roles
function extractUsersRoles(users) {
    var promises = [];

    function assignRoles(id, roles) {
        for (var i = 0; i < users.length; i++) {
            if (users[i].id === id) {
                users[i].roles = roles;
                return;
            }
        }
    }

    users.forEach(function (item) {
        var p = aclService.getAcl().userRoles(item.id.toString()).then(function (roles) {
            assignRoles(item.id, cleanRoles(roles));
        });
        promises.push(p);
    });

    return Promise.all(promises).then(function () {
        return users;
    });
}

UserService.prototype.getUsers = function (fields, options) {
    serviceLogger.debug({query: fields}, 'UserService getUsers');
    options = options || {};
    options.sort = +options.sort || 1;
    options.skip = +options.skip || 0;
    options.top = +options.top || 100;

    // Enforce server-side limit (a limit of 0 disables the limit)
    if (options.top > MAX_LIST_COUNT || options.top <= 0) {
        options.top = MAX_LIST_COUNT;
    }

    // Search fields
    var match = {$match: {}};
    var or = {};
    if (fields && fields.name) {
        // TODO: validate fields.name to protect against ReDoS
        or = {
            $or: [
                {name: new RegExp(fields.name, 'i')},
                {email: new RegExp(fields.name, 'i')}
            ]
        };
        match = {$match: or};
    }

    var aggregate = [
        {
            $project: {
                id: '$_id',
                name: '$name',
                nameLower: {$toLower: '$name'},
                email: '$email',
                avatar_url: '$avatar_url'
            }
        },
        match,
        {$sort: {nameLower: options.sort}}
    ];

    var promises = [];
    // Count of users matching the query
    promises.push(User.count(or).exec());
    // Users requested
    promises.push(User.aggregate(aggregate).skip(options.skip).limit(options.top).exec());
    // Query the total count only if we did specify a name/email
    if (Object.keys(match.$match).length > 0) {
        promises.push(User.count({}).exec());
    }

    return Promise.all(promises)
        .then(function (values) {
            var count = values[0];
            var total = values.length === 3 ? values[2] : count;
            var users = extractUsers(values[1]);
            serviceLogger.debug('Found ' + count + ' users.');
            return extractUsersRoles(users)
                .then(function (list) {
                    return {nbTotalUsers: total, nbUsers: count, users: list};
                });
        })
        .catch(function (err) {
            var error = new NormanError('Failed to retrieve users', err);
            serviceLogger.error(error);
            throw error;
        });
};

UserService.prototype.setRole = function (userId, role, context) {
    serviceLogger.debug({
        userId: userId,
        role: role,
        context: context
    }, '>> setRole');
    if (!userId || !role) {
        serviceLogger.error({userId: userId, role: role}, 'Invalid arguments');
        throw new NormanError('Invalid arguments');
    }
    var that = this;
    return Promise.resolve(User.findOne({_id: userId, deleted: false}, {}).exec())
        .then(function (user) {
            if (user) {
                if (role === 'standard') {
                    aclService.removeUserRole(userId, 'guest', context);
                    return aclService.grantUserRole(userId, role, context);
                }
                aclService.removeUserRole(userId, 'standard', context);
                return aclService.grantUserRole(userId, role, context).then(function () {
                    return that.changeGlobalRole(userId, role, context);
                });
            }

            var err = new Error('Failed to retrieve user');
            serviceLogger.error(err);
            throw new NormanError(err);
        })
        .catch(function (err) {
            serviceLogger.error(err, 'Failed to update user');
            throw new NormanError(err);
        });
};

/**
 * Create a social user account.
 * @param  {object} user
 * @return {Promise}  Return Promise
 */
UserService.prototype.CreateSocialUser = function (user, context) {
    return Promise.resolve(this.rawCreateUser(user, null, context))
        .then(function (createdUser) {
            return createdUser;
        }).catch(function (err) {
            serviceLogger.error(err, 'Failed to create social user.');
            throw new NormanError(err);
        });
};

/**
 * Update
 * @param {ObjectId} id User
 * @param {ObjectId} model Change Model
 * @return {Promise}  Return Promise
 */
UserService.prototype.Update = function (id, model) {
    serviceLogger.info('Update User');
    return Promise.resolve(User.findOneAndUpdate({_id: id}, {$set: model, $inc: {version: 1}}).exec())
        .then(function (user) {
            return user;
        })
        .catch(function (err) {
            serviceLogger.error(err, 'Failed to update user');
            throw new NormanError(err);
        });
};

/**
 * Link Local Account with social account
 * @param {type} id
 * @param {type} model
 */
UserService.prototype.LinkLocalAccount = function (id, model) {
    serviceLogger.info('Update User');
    var deferred = Promise.defer();

    User.findById(id, function (err, user) {
        if (err || user.deleted) {
            serviceLogger.error(new NormanError(err));
            return deferred.reject(new NormanError(err));
        }
        user.password = model.password;
        user.stats.updated_at = Date.now();

        user.save(function (err2) {
            if (err2) {
                serviceLogger.error(new NormanError(err2));
                return deferred.reject(new NormanError(err2));
            }
            deferred.resolve(user);
        });

    });
    return deferred.promise;
};

/**
 * Clean data related to a user then delete the user
 * @param {String} userId
 * @param {object} context
 */
UserService.prototype.delete = function (userId, context) {
    serviceLogger.debug({
        userId: userId,
        context: context
    }, '>> delete');
    var userGlobalChangeHandlers = this.userGlobalChangeHandlers;
    var changeInfo = {
        action: 'delete'
    };
    return this.setDeletedFlag(userId, context, true)
        .then(function (userId) {
            var k = 0, n = userGlobalChangeHandlers.length;

            function nextHandler() {
                var handler;
                if (k >= n) {
                    return Promise.resolve(userId);
                }
                handler = userGlobalChangeHandlers[k++];
                if (typeof handler === 'function') {
                    return Promise.resolve(handler(userId, changeInfo, context)).then(nextHandler);
                }
                return Promise.resolve(handler.onUserGlobalChange(userId, changeInfo, context)).then(nextHandler);
            }

            return nextHandler();
        })
        .then(function () {
            return aclService.removeUserRoles(userId.toString(), context);
        })
        .then(function () {
            var deferred = Promise.defer();
            User.findByIdAndRemove(userId, function (err, user) {
                if (err) {
                    return deferred.reject(err);
                }
                deferred.resolve((user) ? user.email : user);
            });
            return deferred.promise;
        })
        .then(function (userEmail) {
            if (userEmail) {
                return accessService.delete(userEmail, context);
            }
        })
        .catch(function (err) {
            var error = new NormanError('Failed to delete user ' + userId, err);
            serviceLogger.error(error);
            throw error;
        });
};

UserService.prototype.changeGlobalRole = function (userId, role, context) {
    serviceLogger.debug({
        userId: userId,
        role: role,
        context: context
    }, '>> changeGlobalRole');
    var userGlobalChangeHandlers = this.userGlobalChangeHandlers;
    var changeInfo = {
        action: 'roleChange',
        newRole: role
    };
    return this.setGlobalRoleChange(userId, context, role)
        .then(function (userId) {
            var k = 0, n = userGlobalChangeHandlers.length;

            function nextHandler() {
                var handler;
                if (k >= n) {
                    return Promise.resolve(userId);
                }
                handler = userGlobalChangeHandlers[k++];
                if (typeof handler === 'function') {
                    return Promise.resolve(handler(userId, changeInfo, context)).then(nextHandler);
                }
                return Promise.resolve(handler.onUserGlobalChange(userId, changeInfo, context)).then(nextHandler);
            }

            return nextHandler();
        })
        .then(function (userId) {
            var deferred = Promise.defer();
            User.findById(userId, function (err, user) {
                if (err || user.deleted) {
                    serviceLogger.error(new NormanError(err));
                    return deferred.reject(new NormanError(err));
                }
                user.globalRoleChange = null;
                user.save(function (err2) {
                    if (err2) {
                        serviceLogger.error(new NormanError(err2));
                        return deferred.reject(new NormanError(err2));
                    }
                    deferred.resolve(user);
                });
            });
            return deferred.promise;
        })
        .catch(function (err) {
            var error = new NormanError('Failed to change global role of user  ' + userId, err);
            serviceLogger.error(error);
            throw error;
        });
};

/**
 * Set User's deleted flag, if it's set to true the user is about to be deleted but cleaning it's data is done before
 * @param {String}  userId
 * @param {Object}  context
 * @param {Boolean} flag
 */
UserService.prototype.setDeletedFlag = function (userId, context, flag) {
    serviceLogger.debug({
        userId: userId,
        context: context,
        flag: flag
    }, '>> setDeletedFlag');
    var deferred = Promise.defer();
    User.findById(userId, function (err, user) {

        if (err) {
            serviceLogger.error(new NormanError(err));
            if (context) {
                auditService.logEvent('User', 'Set deleted flag failed', 'Set deleted flag failed', null, context);
            }
            return deferred.reject(new NormanError(err));
        }

        if (user.deleted !== flag) {
            user.deleted = flag;
            user.save(function (err) {
                if (err) {
                    serviceLogger.error(new NormanError(err));
                    if (context) {
                        auditService.logEvent('User', 'Set deleted flag failed', 'Set deleted flag failed', {error: err}, context);
                    }
                    return deferred.reject(err);
                }
                deferred.resolve(user);
            });
        }
        else {
            deferred.resolve(userId);
        }
    });
    return deferred.promise;
};

UserService.prototype.setGlobalRoleChange = function (userId, context, role) {
    serviceLogger.debug({
        userId: userId,
        context: context,
        role: role
    }, '>> setGlobalRoleChange');
    var deferred = Promise.defer();
    User.findById(userId, function (err, user) {
        if (err) {
            serviceLogger.error(new NormanError(err));
            if (context) {
                auditService.logEvent('User', 'Set globalRoleChange failed', 'Set globalRoleChange failed', null, context);
            }
            return deferred.reject(new NormanError(err));
        }

        if (user.globalRoleChange !== role) {
            user.globalRoleChange = role;
            user.save(function (err) {
                if (err) {
                    serviceLogger.error(new NormanError(err));
                    if (context) {
                        auditService.logEvent('User', 'Set globalRoleChange failed', 'Set globalRoleChange failed', {error: err}, context);
                    }
                    return deferred.reject(err);
                }
                deferred.resolve(userId);
            });
        }
        else {
            deferred.resolve(userId);
        }
    });
    return deferred.promise;
};

/**
 * Modules to call this API in order to register handlers for user global change which includes user deletion cleanup and change role. These Function will take User_Id (type ObjectId) as parameter
 * @param {function|object} handler handler
 */
UserService.prototype.registerUserGlobalChangeHandlers = function (handler) {
    serviceLogger.info('Register callback for UserGlobalChange');
    var t = typeof handler;
    var valid = (t === 'function') || ((t === 'object') && (typeof handler.onUserGlobalChange === 'function'));
    if (!valid) {
        throw new TypeError('Invalid UserGlobalChange callback');
    }
    this.userGlobalChangeHandlers.push(handler);
};

/**
 *  Get preferences
 * @param id
 */
UserService.prototype.getPreferences = function (id) {
    var deferred = Promise.defer();

    User.findOne({
            _id: id,
            deleted: false
        }, 'preferences',
        function (error, preferences) {
            if (error) {
                serviceLogger.error(new NormanError('Unable to get user preferences', error));
                deferred.reject(new NormanError('Unable to get user preferences', error));
            }
            deferred.resolve(preferences);
        });

    return deferred.promise;
};

/**
 *  Update preferences
 * @param userId
 * @param preferences
 * @param context
 */
UserService.prototype.updatePreferences = function (userId, preferences, context) {
    serviceLogger.debug({
        userId: userId,
        preferences: preferences,
        context: context
    }, '>> updatePreferences');
    var deferred = Promise.defer();
    User.findById(userId, function (err, user) {
        if (err || user.deleted) {
            serviceLogger.error(new NormanError(err));
            return deferred.reject(new NormanError(err));
        }

        var changes = {};
        changes.old_preferences = {};
        changes.new_preferences = {};
        changes.old_preferences.help = {};
        changes.new_preferences.help = {};
        changes.old_preferences.projectsHelp = {};
        changes.new_preferences.projectsHelp = {};
        if (user.preferences.help.disable !== preferences.help.disable) {

            changes.old_preferences.help.disable = user.preferences.help.disable;
            changes.new_preferences.help.disable = preferences.help.disable;
            user.preferences.help.disable = preferences.help.disable;
        }

        if (user.preferences.projectsHelp.disable !== preferences.projectsHelp.disable) {

            changes.old_preferences.projectsHelp.disable = user.preferences.projectsHelp.disable;
            changes.new_preferences.projectsHelp.disable = preferences.projectsHelp.disable;
            user.preferences.projectsHelp.disable = preferences.projectsHelp.disable;
        }

        user.updatedAt = Date.now();

        user.save(function (err2) {
            if (err2) {
                serviceLogger.error(new NormanError(err2));
                changes.error = err2;
                return deferred.reject(err2);
            }
            deferred.resolve(user);
        });

    });
    return deferred.promise;
};

UserService.prototype.updateUserPrincipal = function (authority) {
    return Promise.resolve(User.find({}).exec())
        .then(function (users) {
            var promises = [];

            users.forEach(function (user) {
                var issuer = authority || certificateUtils.getIssuerFromPrincipal(user.principal);
                var newPrincipal = certificateUtils.getPrincipalFromMailAndIssuer(user.email, issuer);
                if (user.principal !== newPrincipal) {
                    user.principal = newPrincipal;
                    promises.push(Promise.resolve(user.save()));
                }
            });

            return Promise.all(promises).then(function () {
                return users;
            });
        });
};

UserService.prototype.updateUserPrincipal = function (authority) {
    return Promise.resolve(User.find({}).exec())
        .then(function (users) {
            var promises = [];

            users.forEach(function (user) {
                var issuer = authority || certificateUtils.getIssuerFromPrincipal(user.principal);
                var newPrincipal = certificateUtils.getPrincipalFromMailAndIssuer(user.email, issuer);
                if (user.principal !== newPrincipal) {
                    user.principal = newPrincipal;
                    promises.push(Promise.resolve(user.save()));
                }
            });

            return Promise.all(promises).then(function () {
                return users;
            });
        });
};

UserService.prototype.filteredList = function (fields, filter) {
    serviceLogger.debug('filteredList');

    return Promise.resolve(User.find(filter, fields).lean().exec());
};

UserService.prototype.importUser = function (user, context) {
    var newUser = {
        email: user.email,
        name: user.name,
        principal: user.principal,
        provider: user.provider
    };

    return this.rawCreateUser(newUser, null, context)
        .then(function (user) {
            auditService.logEvent('Authentication', 'import user', 'import user is successful', {
                email: newUser.email,
                name: newUser.name || ''
            }, context);
            return user;
        })
        .catch(function (err) {
            auditService.logEvent('Authentication', 'import user', 'import user failed', {
                email: newUser.email,
                name: newUser.name || '',
                error: err
            }, context);
            throw new NormanError('Failed to import user', err);
        });
};

UserService.prototype.importUsers = function (userList, context) {
    serviceLogger.debug('importUsers');

    var promises = [];
    var self = this;
    userList.forEach(function (user) {
        promises.push(self.importUser(user, context));
    });

    return Promise.waitAll(promises).then(function (results) {
        serviceLogger.debug(results);
        return results;
    })
    .catch(function (createErrors) {
        var results = [];
        var allFailed = true;
        if (createErrors && createErrors.detail) {
            if (createErrors.detail.results) {
                createErrors.detail.results.forEach(function (currResult, index) {
                    if (currResult) {
                        results.push(currResult);
                        allFailed = false;
                    }
                    else {
                        results.push(createErrors.detail.errors[index]);
                    }
                });
            }
        }

        if (allFailed) {
            // throw only if all invite failed
            var error = new NormanError('Unable to import users', createErrors);
            throw error;
        }
        return results;
    });
};