'use strict';
var commonServer = require('norman-common-server');
var authLogger = commonServer.logging.createLogger('security.authentication.x509');
var AuthenticationMethod = require('../constants/auth-method');
var certificateUtils = require('../utils/certificateUtils');
var userService;
var auditService;

function getUserService() {
    if (!userService) {
        userService = commonServer.registry.getModule('UserService');
    }
    return userService;
}

function getAuditService() {
    if (!auditService) {
        auditService = commonServer.registry.getModule('AuditService');
    }
    return auditService;
}

function formatCertificateHeader(certHeader) {
    var k, n, certificate = '-----BEGIN CERTIFICATE-----\n';
    n = (certHeader ? certHeader.length : -1);
    for (k = 0; k < n; k += 64) {
        certificate += certHeader.substring(k, k + 64) + '\n';
    }
    certificate += '-----END CERTIFICATE-----\n';
    return certificate;
}

function validateTrustConfig(trust) {
    var result;
    if (Array.isArray(trust)) {
        if (trust.length > 0) {
            result = trust.slice();
        }
    }
    else if (trust && (typeof trust === 'object')) {
        result = [ trust ];
    }
    return result;
}

function compare(target, ref) {
    var k, n, key, keys, valid = false;
    if (!ref) {
        return true;
    }
    if (!target) {
        return false;
    }
    if (typeof ref === 'object') {
        if (typeof target === 'object') {
            keys = Object.keys(ref);
            n = keys.length;
            valid = true;
            for (k = 0; k < n; ++k) {
                key = keys[k];
                if (target[key] !== ref[key]) {
                    valid = false;
                    break;
                }
            }
        }
    }
    else {
        valid = (ref === target);
    }
    return valid;
}

function certCompare(cert, refCert) {
    var match = compare(cert.subject, refCert.subject);
    match = match && compare(cert.issuer, refCert.issuer);
    match = match && compare(cert.fingerprint, refCert.fingerprint);
    return match;
}

function isTrusted(clientCert, trust) {
    var cert, k, n = trust.length, trusted = false;
    var now = Date.now();
    if ((clientCert.valid_from > now) || (clientCert.valid_to < now)) {
        return false;
    }
    for (k = 0; !trusted && (k < n); ++k) {
        cert = trust[k];
        trusted = certCompare(clientCert, cert);
    }
    return trusted;
}

function getX509() {
    return function (req, res, next) {
        var userCert;
        req.context = req.context || {};
        if (req.context.auth && req.context.auth.method) {
            authLogger.debug('User already authenticated, skipping authentication');
            return next();
        }

        userCert = req.connection.getPeerCertificate();
        if (req.connection.authorized) {
            authLogger.debug({cert: userCert}, 'User authenticated');

            req.context.auth = {
                method: AuthenticationMethod.X509,
                x509: userCert
            };

            var principalName = certificateUtils.getPrincipalName(userCert);
            getUserService().getUserByPrincipal(principalName)
                .then(function (user) {
                    req.context.user = req.user = user;
                    next();
                })
                .catch(function (err) {
                    authLogger.warn(err, 'Unknown user');
                    next();
                });
        }
        else {
            if (userCert) {
                authLogger.info({cert: userCert}, 'Invalid client certificate');
            }
            next();
        }
    };
}

function getPrincipalPropagation(ppConfig) {
    var x509, certHeader, trust, allowX509;
    x509 = require('x.509');
    certHeader = (ppConfig.header && ppConfig.header.toLowerCase()) || 'ssl_client_cert';
    trust = validateTrustConfig(ppConfig.trust);
    if (!trust) {
        throw new Error('Missing or invalid trust configuration for principal propagation');
    }
    allowX509 = !!ppConfig.allowX509;
    return function (req, res, next) {
        var clientCert, userCert, principalName;

        req.context = req.context || {};
        if (req.context.auth && req.context.auth.method) {
            authLogger.debug('User already authenticated, skipping authentication');
            return next();
        }

        clientCert = req.connection.getPeerCertificate();
        if (req.connection.authorized) {
            if (isTrusted(clientCert, trust)) {
                authLogger.debug({cert: clientCert}, 'Trusted client authenticated');
                userCert = formatCertificateHeader(req.headers[certHeader]);
                try {
                    userCert = x509.parseCert(userCert);
                    authLogger.debug({cert: userCert}, 'User authenticated');
                    req.context.auth = {
                        method: AuthenticationMethod.PRINCIPAL_PROPAGATION,
                        certificate: userCert
                    };

                    principalName = certificateUtils.getPrincipalName(userCert);

                    getAuditService().logEvent('Authentication', 'signup', 'authentication is successful', { principalName: principalName }, req.context);

                    getUserService().getUserByPrincipal(principalName)
                        .then(function (user) {
                            req.context.user = req.user = user;
                            next();
                        })
                        .catch(function (err) {
                            authLogger.warn(err, 'Unknown user');
                            next();
                        });
                }
                catch(err) {
                    authLogger.warn(err, { header: req.headers[certHeader] }, 'Failed to parse delegated user certificate');
                    next();
                }
            }
            else {
                if (allowX509) {
                    authLogger.debug({cert: clientCert}, 'User authenticated');
                    req.context.auth = {
                        method: AuthenticationMethod.X509,
                        certificate: clientCert
                    };
                    principalName = certificateUtils.getPrincipalName(clientCert);
                    getUserService().getUserByPrincipal(principalName)
                        .then(function (user) {
                            req.context.user = req.user = user;
                            next();
                        })
                        .catch(function (err) {
                            authLogger.warn(err, 'Unknown user');
                            next();
                        });
                }
                else {
                    authLogger.warn({cert: clientCert}, 'Client certificate not trusted for principal propagation');
                    getAuditService().logEvent('Authentication', 'signup failed', 'Client certificate not trusted for principal propagation', { cert: clientCert }, req.context);
                    next();
                }
            }
        }
        else {
            if (clientCert) {
                authLogger.info({cert: clientCert}, 'Invalid client certificate');
                getAuditService().logEvent('Authentication', 'signup failed', 'Invalid client certificate', { cert: clientCert }, req.context);
            }
            next();
        }
    };
}

module.exports = function (options) {
    if (options && options.principalPropagation) {
        return getPrincipalPropagation(options.principalPropagation);
    }
    return getX509(options);
};
