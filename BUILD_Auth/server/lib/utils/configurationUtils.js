'use strict';

var commonServer = require('norman-common-server');

exports.getSecureFlag = function () {
    var httpConfig = commonServer.config.get('http') || {};
    var secure = true;
    if (httpConfig.secureFlag !== undefined) {
        secure = !!httpConfig.secureFlag;
    }
    return secure;
};

exports.getSessionIdTokenName = function () {
    var result = 'buildSessionId';
    var httpConfig = commonServer.config.get('http') || {};
    if (httpConfig.sessionIdTokenName) {
        result = httpConfig.sessionIdTokenName.toString();
    }
    return result;
};
