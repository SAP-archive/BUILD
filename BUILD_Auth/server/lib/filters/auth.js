'use strict';

var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('auth-service');
var NormanError = commonServer.NormanError;
var userService;
var xsrf = require('./xsrf');
var AuthenticationMethod = require('../constants/auth-method');

function getUserService() {
    if (!userService) {
        userService = commonServer.registry.getModule('UserService');
    }
    return userService;
}

function createUser() {
    return function (req, res, next) {
        var authService = commonServer.registry.getModule('AuthService');
        var error;
        if (!req.context.auth) {
            // User could not be authenticated
            serviceLogger.debug('Request not authenticated');
            return res.status(401).json();
        }

        if (!req.context.user) {
            getUserService().createX509User(req.context)
                .then(function (user) {
                    authService.initializeSession(user._id, res);
                    xsrf.setToken(res);
                    req.user = user;
                    req.context.user = user;
                    next();
                })
                .catch(function (err) {
                    error = new NormanError('Failed to provision new user', err);
                    serviceLogger.error(error);
                    return res.status(500).json(error);
                });
        }
        else {
            if (req.context.auth.method === AuthenticationMethod.JWT) {
                authService.renewSession(req.context.session, res);
            }
            else {
                authService.initializeSession(req.context.user._id, res);
                xsrf.setToken(res);
            }
            next();
        }
    };
}

function requireRegistration() {
    return function (req, res, next) {
        var authService = commonServer.registry.getModule('AuthService');
        if (!req.context.auth) {
            // User could not be authenticated
            serviceLogger.debug('Request not authenticated');
            return res.status(401).json();
        }
        if (!req.context.user) {
            res.setHeader('Registration', 'Required');
            xsrf.setToken(res);
            return res.status(403).json();
        }
        if (req.context.auth.method === AuthenticationMethod.JWT) {
            authService.renewSession(req.context.session, res);
        }
        else {
            authService.initializeSession(req.context.user._id, res);
            xsrf.setToken(res);
        }
        next();
    };
}

module.exports = {
    getFilter: function (options) {
        options = options || {};
        if (options.createUser && options.createUser === true) {
            return createUser();
        }
        return requireRegistration();
    }
};
