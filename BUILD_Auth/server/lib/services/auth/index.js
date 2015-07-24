'use strict';

var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var serviceLogger = commonServer.logging.createLogger('auth-service');
var sessionLogger = commonServer.logging.createLogger('security.session');

var config = commonServer.config.get();
var secret = require('../../../secret.js');
var filters = require('../../filters');
var configurationUtils = require('../../utils/configurationUtils');

var roleConfig = config.roles;
var jwt = require('jsonwebtoken');
var compose = require('norman-server-tp')['composable-middleware'];
var createToken = commonServer.utils.token;

config.session = config.session || {};
config.session.expiration = config.session.expiration || 30; // Default session expiration 30 minutes
sessionLogger.info('Session expiration set to ' + config.session.expiration + ' minute(s)');

function AuthService() {
}

module.exports = AuthService;

AuthService.prototype.initialize = function (done) {
    serviceLogger.info('initialize');
    done();
};

AuthService.prototype.onInitialized = function (done) {
    serviceLogger.debug('AuthService>>onInitialized>>');
    done();
};

AuthService.prototype.shutdown = function () {
    serviceLogger.info('shutdown');
};

AuthService.prototype.isAuthenticated = function () {
    return compose().use(function (req, res, next) {
        serviceLogger.info('isAuthenticated is deprecated, please remove from route');
        next();
    });
};

AuthService.prototype.authenticated = function (req, res, next) {
    serviceLogger.info('authenticated');
    if (req.isAuthenticated()) {
        return next();
    }

    serviceLogger.info('User not authenticated');
    res.send(401, 'User not authenticated');
};

/**
 * Checks if the user role meets the minimum requirements of the route
 */
AuthService.prototype.hasRole = function (roleRequired) {
    serviceLogger.info('hasRole');
    if (!roleRequired) {
        serviceLogger.error('Required role needs to be set');
        throw new NormanError('Required role needs to be set');
    }

    return compose()
        .use(this.isAuthenticated())
        .use(function meetsRequirements(req, res, next) {
            if (roleConfig.userRoles.indexOf(req.user.role) >= roleConfig.userRoles.indexOf(roleRequired)) {
                next();
            }
            else {
                res.send(403);
            }
        });
};

AuthService.prototype.createSession = function (userId) {
    var sessionId = createToken(16);
    userId = userId.toString();
    sessionLogger.info('Creating session ' + sessionId + ' for user ' + userId);
    return {
        id: sessionId,
        user: userId
    };
};

AuthService.prototype.createToken = function (session) {
    sessionLogger.debug('Creating token for session ' + session.id);
    return jwt.sign(session, secret.getSessionKey(), { expiresInMinutes: config.session.expiration });
};

AuthService.prototype.initializeSession = function (userId, res) {
    var session = this.createSession(userId);
    var token = this.createToken(session);
    res.cookie(configurationUtils.getSessionIdTokenName(), token, { httpOnly: true, secure: configurationUtils.getSecureFlag()});
    return token;
};

AuthService.prototype.renewSession = function (session, res) {
    var token = this.createToken(session);
    sessionLogger.info('Renewing session ' + session.id + ' for user ' + session.user);
    res.cookie(configurationUtils.getSessionIdTokenName(), token, { httpOnly: true, secure: configurationUtils.getSecureFlag()});
    return token;
};

/**
 * Set token cookie directly for oAuth strategies
 */
AuthService.prototype.setTokenCookie = function (req, res) {
    serviceLogger.info('setTokenCookie');
    if (!req.user) {
        serviceLogger.info('setTokenCookie>> Something went wrong, please try again.');
        return res.status(404).json({ message: 'Something went wrong, please try again.'});
    }
    this.initializeSession(req.user._id, res);
    filters.xsrf.setToken(res);
    var security = commonServer.config.get('security');
    if (security && security.application && security.application.admin === true) {
        res.redirect('/console/users');
    }
    else {
        res.redirect('/norman');
    }
};

AuthService.prototype.getPolicyInfo = function (req, res) {
    serviceLogger.info('getPolicyInfo');
    res.status(200).json({policy: config.security.passwordPolicy});
};

/**
 *  This gets the ID from currently logged in user
 */
AuthService.prototype.getUserId = function (req) {
    serviceLogger.info('getUserId');
    return req.user && req.user._id.toString() || false;
};
