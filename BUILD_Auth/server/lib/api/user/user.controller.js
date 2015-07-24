'use strict';
var secret = require('../../../secret.js');

var jwtoken = require('jsonwebtoken');
var filters = require('../../filters');

var commonServer = require('norman-common-server');
var registry = commonServer.registry;

var userService = registry.getModule('UserService');
var aclService = registry.getModule('AclService');
var authService = registry.getModule('AuthService');

var NormanError = commonServer.NormanError;

var LAST_MODIFIED = 'last-modified';
var IF_MODIFIED_SINCE = 'if-modified-since';
var EXPIRES = 'expires';
var CACHE_CONTROL = 'cache-control';
var PRAGMA = 'pragma';

var serviceLogger = commonServer.logging.createLogger('user-ctrl');

module.exports.checkUserId = function (req, res, next) {
    var error;
    if (!req.user || (req.user._id.toString() !== req.params.id)) {
        // Users are not allowed to act on other users :-)
        error = new NormanError('Invalid user id', 404);
        serviceLogger.warn(error);
        res.status(404).json(error);
    }
    else {
        next();
    }
};

/**
 * Creates a new user
 */
module.exports.create = function (req, res) {
    var newUser = req.body,
        token;

    if (!newUser.password) {
        res.status(400).json(new NormanError('Failed to create user: Password is required'));
        return;
    }
    if (!newUser.name) {
        res.status(400).json(new NormanError('Failed to create user: User\'s Name is required'));
        return;
    }
    if (!newUser.email) {
        res.status(400).json(new NormanError('Failed to create user: User\'s Email is required'));
        return;
    }

    newUser.provider = 'local';
    var url = 'http://' + req.headers.host + '/verifyemail';
    var emailTemplateData = {
        url: url
    };
    userService.createUser(req.body, emailTemplateData, req.context)
        .then(function (user) {
            token = jwtoken.sign({
                _id: user._id
            }, secret.getSessionKey(), {
                expiresInMinutes: 60 * 5
            });
            if (!user) {
                serviceLogger.error(new NormanError('Failed to create user'));
                res.status(404).json(new NormanError('Failed to create user'));
                return;
            }
            res.status(201).json({
                token: token
            });
        }).catch(function (error) {
            res.status(500).json(new NormanError('Failed to create user' + error));
        });
};

/**
 * Get my info
 */
module.exports.me = function (req, res) {
    var userId;
    if (req.user) {
        userId = req.user._id;
        userService.getUserById(userId)
            .then(function (user) {
                if (!user) {
                    res.status(404).json(new NormanError('Unable to find user'));
                    return;
                }
                aclService.getAcl().userRoles(user._id.toString(), function (err, roles) {
                    if (err) {
                        serviceLogger.error(new NormanError(err));
                        res.status(500).json(new NormanError('Problem getting user', err));
                        return;
                    }
                    user = user.toJSON();
                    user.acl_roles = roles;
                    serviceLogger.info('<< getUserById(), returning user object');
                    res.status(200).json(user);
                });
            })
            .catch(function (error) {
                res.status(500).json(new NormanError('Unable to get user', error));
            });
    }
    else {
        res.status(404).json(new NormanError('Unable to find user'));
    }
};

/**
 * Get list of users
 */
module.exports.index = function (req, res) {
    userService.list()
        .then(function (users) {
            if (!users) {
                res.status(404).json(new NormanError('Unable to find users'));
                return;
            }
            res.status(200).json(users);
        })
        .catch(function (error) {
            res.status(500).json(new NormanError('Unable to get user list', error));
        });
};

/**
 * Verify account email address
 */
module.exports.verifyEmail = function (req, res) {
    var url = 'http://' + req.headers.host + '/verifyemail';

    var emailTemplateData = {
        url: url
    };
    userService.verifyEmail(req.params.id, emailTemplateData, req.context)
        .then(function (data) {
            if (!data) {
                res.status(404).json(new NormanError('Unable to find user with email'));
                return;
            }
            res.status(200).json(data);
        }).catch(function (err) {
            res.status(500).json(new NormanError('Unable to verify email', err));
        });

};

/**
 * resend Verification Email
 */
module.exports.resetPasswordTokenValidation = function (req, res) {
    userService.resetPasswordTokenValidation(req.params.id)
        .then(function (user) {
            if (!user) {
                res.status(404).json(new NormanError('Unable to find user'));
                return;
            }

            if (user.request_password_token_expired < Date.now()) {
                res.status(200).json({
                    status: 'expired',
                    message: 'The resource your are looking for has been expired, please try again later.'
                });
            }
            else {
                res.status(200).json({
                    status: 'verified',
                    name: user.name,
                    email: user.email,
                    message: 'Your email address has been verified.'
                });
            }
        }).catch(function (err) {
            res.status(500).json(new NormanError('Unable to reset password token validation', err));
        });
};

/**
 * Request Password
 */
module.exports.requestPwd = function (req, res) {
    userService.requestPwd(req.params.id.toLowerCase(), req)
        .then(function () {
            //Always returns a success message even if the address does not match a known user in order to avoid users email address sniffing
             res.status(200).json({
                status: 'success',
                message: 'Email has been sent to ' + req.params.id + ' with password reset instructions.'
            });
        }).catch(function (err) {
            res.status(500).json(new NormanError('Unable to send password reset instructions', err));
        });
};

/**
 * Resend Verification Email
 */
module.exports.resendVerificationEmail = function (req, res) {
    var url = 'http://' + req.headers.host + '/verifyemail';
    var emailTemplateData = {
        url: url
    };
    userService.resendVerificationEmail(req.params.id, emailTemplateData)
        .then(function (data) {
            if (!data) {
                res.status(404).json(new NormanError('The ' + req.params.id + ' email is not registered'));
                return;
            }
            res.status(200).end();
        }).catch(function (err) {
            res.status(500).json(new NormanError('Unable to resend verification email', err));
        });
};

/**
 * Reset a users password
 */
module.exports.resetPassword = function (req, res) {
    var newPass = String(req.body.newPassword);
    var token = req.params.id;

    userService.resetPassword(token, newPass, req)
        .then(function (user) {
            if (!user) {
                res.status(404).json(new NormanError('The ' + req.params.id + ' email is not registered'));
                return;
            }
            if (user.request_password_token_expired > Date.now()) {
                // token has been expired
                res.status(200).json({
                    status: 'expired',
                    message: 'The resource your are looking for has been expired, please try again later.'
                });
            }
            else {

                var signedtoken = authService.initializeSession(user._id, res);
                filters.xsrf.setToken(res);
                res.status(200).json({token: signedtoken});
            }
        }).catch(function (err) {
            res.status(500).json(new NormanError('unable to reset password', err));
        });
};

/**
 * Get a single user
 */
module.exports.show = function (req, res) {
    userService.show(req.params.id)
        .then(function (user) {
            if (!user) {
                res.status(404).json(new NormanError('Unable to find user'));
                return;
            }
            res.status(200).json(user);
        }).catch(function (err) {
            res.status(500).json(new NormanError('Error finding user', err));
        });
};

/**
 * Get multiple users
 */
module.exports.showAvatarList = function (req, res) {
    var userList = req.body.user_list;

    if (!userList || !(userList instanceof Array) || userList.length === 0) {
        res.status(400).json(new NormanError('Missing required fields'));
        return;
    }

    userService.showAvatarList(userList)
        .then(function (users) {
            if (!users) {
                res.status(404).json(new NormanError('Users not found'));
                return;
            }
            res.status(200).json(users);
        }).catch(function (err) {
            res.status(500).json(new NormanError('Error retrieving avatar list', err));
        });
};

/**
 * Deletes a user
 */
module.exports.destroy = function (req, res) {
    userService.destroy(req.params.id)
        .then(function (user) {
            if (!user) {
                res.status(404).json(new NormanError('Unable to find user'));
                return;
            }
            res.status(204).end();
        }).catch(function (err) {
            res.status(500).json(new NormanError('Error destroying user', err));
        });
};

/**
 * Change a users password
 */
module.exports.changePassword = function (req, res) {
    var userId = req.user._id;
    var oldPass = String(req.body.oldPassword);
    var newPass = String(req.body.newPassword);

    userService.changePassword(userId, oldPass, newPass, req)
        .then(function (user) {
            if (!user) {
                res.status(404).json(new NormanError('Unable to find user'));
                return;
            }
            res.status(200).end();
        }).catch(function (err) {
            serviceLogger.error(new NormanError('Error changing password', err));
            res.status(500).json(err);
        });
};

/**
 * Change a users avatar
 */
module.exports.changeAvatar = function (req, res) {

    var avatar = req.files.avatar; // array
    var fileType = req.body.type || avatar.mimetype;
    var userId = req.user._id;

    // immediately return error if the filetype is incorrect
    if (fileType !== 'image/jpeg' && fileType !== 'image/png' && fileType !== 'image/gif') {
        res.status(500).json(new NormanError('invalid file type'));
        return;
    }

    userService.changeAvatar(userId, avatar, fileType, req.context)
        .then(function (user) {
            if (!user) {
                res.status(404).json(new NormanError('Unable to find user'));
                return;
            }
            res.status(200).end();
        }).catch(function (err) {
            res.status(500).json(new NormanError('Unable to change avatar', err));
        });
};

/**
 * Delete a users avatar
 */
module.exports.removeAvatar = function (req, res) {
    var userId = req.user._id;

    userService.removeAvatar(userId, req.context)
        .then(function (user) {
            if (!user) {
                res.status(404).json(new NormanError('User not found'));
                return;
            }
            res.status(200).end();
        }).catch(function (err) {
            res.status(500).json(new NormanError('Unable to delete avatar', err));
        });
};

/**
 * Change a users profile
 */
module.exports.updateProfile = function (req, res) {
    var userId = req.user._id;

    var newUser = {name: req.body.name, email: req.body.email};

    userService.updateProfile(userId, newUser, req.context)
        .then(function (user) {
            if (!user) {
                res.status(404).json(new NormanError('Unable to find user'));
                return;
            }
            res.status(200).end();
        }).catch(function (err) {
            res.status(500).json(err);
        });
};

/**
 * Get Avatar image or url
 *
 */
module.exports.picture = function (req, res) {
    var userId = req.params.id;

    userService.picture(userId)
        .then(function (user) {
            if (!user) {
                res.status(404).json(new NormanError('Unable to find user'));
                return;
            }
            if (!user.avatar_url) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).json({message: 'no image url present'});
                return;
            }
            var reqModSince = req.headers[IF_MODIFIED_SINCE];

            if (reqModSince != null) {
                reqModSince = new Date(reqModSince);
                // IF-MODIFIED-SINCE does not support milliseconds so we compare the 2 dates and
                // assume they are identical if their difference is less than a second.
                var delta = Math.abs(reqModSince.getTime() - user.avatar_last_modified.getTime());
                if (delta <= 1000) {
                    serviceLogger.info('<< picture(), send a 304 header without image data');
                    res.writeHead(304, {'Last-Modified': user.avatar_last_modified.toUTCString()});
                    res.end();
                    return;
                }
            }

            serviceLogger.info('<< picture(), sending picture');
            if (user.avatar_bin && user.avatar_content_type) {
                var image = new Buffer(user.avatar_bin, 'base64');
                res.contentType(user.avatar_content_type);

                res.set(CACHE_CONTROL, 'private, max-age=86400');
                res.set(PRAGMA, 'cache');
                res.set(EXPIRES, new Date().toUTCString());
                res.set(LAST_MODIFIED, user.avatar_last_modified.toUTCString());

                res.writeHead(200, {'Content-Length': image.length});
                res.end(image);
                return;
            }
            res.status(200).json(user.avatar_url);
        }).catch(function (err) {
            serviceLogger.info('<< picture(), return error', err);
            res.status(500).json(new NormanError('Unable to retrieve user picture', err));
        });
};

/**
 * Authentication callback
 */
module.exports.authCallback = function (req, res) {
    res.redirect('/');
};

/**
 * Get preferences
 */
module.exports.getPreferences = function (req, res) {
    var userId;
    if (req.user) {
        userId = req.user._id;
        userService.getPreferences(userId)
            .then(function (preferences) {
                serviceLogger.info('<< getPreferences(), returning preferences object');
                res.status(200).json(preferences);
            })
            .catch(function (error) {
                res.status(500).json(new NormanError('Unable to find preferences', error));
            });
    }
    else {
        res.status(404).json(new NormanError('Unable to find preferences'));
    }
};

/**
 * Update preferences
 */
module.exports.updatePreferences = function (req, res) {

    var userId = req.user._id;
    var preferences = {help: {disable: req.body.help.disable}, projectsHelp: {disable: req.body.projectsHelp.disable}};

    userService.updatePreferences(userId, preferences, req.context)
        .then(function (user) {
            if (!user) {
                res.status(404).json(new NormanError('Unable to find user'));
                return;
            }
            res.status(200).end();
        }).catch(function (err) {
            res.status(500).json(err);
        });
};
