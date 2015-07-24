'use strict';
var secret = require('../../secret.js');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('security.authentication.jwt');

var AuthenticationMethod = require('../constants/auth-method');
var configurationUtils = require('../utils/configurationUtils');

var authzRegExp = /^\s*Bearer\s+([0-9A-Za-z\-_\.]+)/;

function getToken(req) {
    // Precedence order to retrieve token is
    //   1. access_token query string parameter
    //   2. Authorization header
    //   3. Cookie
    var match;
    var sessionIdTokenName = configurationUtils.getSessionIdTokenName();
    var token = req.cookies && req.cookies[sessionIdTokenName];
    if (req.query && req.query.hasOwnProperty('access_token')) {
        token = req.query.access_token;
    }
    else if (req.headers && req.headers.authorization) {
        match = authzRegExp.exec(req.headers.authorization);
        if (match) {
            token = match[1];
        }
    }
    return token;
}

module.exports = {
    getFilter: function () {
        var options = {
            secret: secret.getSessionKey(),
            requestProperty: 'jwt',
            getToken: getToken
        };
        serviceLogger.info('Creating JWT filter');
        var validateJwt = expressJwt(options);
        var userService;
        return function (req, res, next) {
            req.context = req.context || {};
            if (!userService) {
                userService = commonServer.registry.getModule('UserService');
            }
            // Check if request has already been authenticated
            if (req.context.auth && req.context.auth.method) {
                serviceLogger.debug('User already authenticated, skipping authentication');
                return next();
            }
            var token = getToken(req);
            if (!token) {
                // No token, skip validation
                serviceLogger.debug('No session token found');
                return next();
            }

            // Validate jwt
            Promise.invoke(validateJwt, req, res)
                .then(function () {
                    var jwt = req.jwt;
                    serviceLogger.debug({jwt: jwt}, 'Session token validated');
                    req.context.session = {
                        id: jwt.id,
                        user: jwt.user
                    };
                    return userService.getUserPrincipal(jwt.user);
                })
                .then(function (user) {
                    if (user) {
                        serviceLogger.debug({user: user}, 'User authenticated');
                        req.context.user = req.user = user;
                        req.context.auth = {
                            method: AuthenticationMethod.JWT,
                            userId: user._id.toString()
                        };
                        next();
                    }
                })
                .catch(function (err) {
                    try {
                        token = jwt.decode(token);
                    }
                    catch (decodeError) {
                        serviceLogger.debug(decodeError, 'Failed to decode invalid session token');
                    }
                    serviceLogger.warn(err, { jwt: token }, 'Invalid session token');
                    next();
                });
        };
    }
};
