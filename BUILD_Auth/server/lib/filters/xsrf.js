'use strict';

var util = require('util');
var commonServer = require('norman-common-server');

function getValidOptions(options) {
    var result = { headerName: 'x-csrf-token', cookieName: 'X-CSRF-Token', secureFlag: true };
    var httpConfig = commonServer.config.get('http') || {};
    if (httpConfig.secureFlag !== undefined) {
        result.secureFlag = !!httpConfig.secureFlag;
    }
    util._extend(result, options);
    result.headerName = result.headerName.toLowerCase();
    return result;
}

var storedOptions = getValidOptions();
var errorMessage = 'Invalid xsrf token. Please contact your administrator.';

module.exports = {
    setToken: function (res) {
        var token = commonServer.utils.token(16);
        res.setHeader(storedOptions.headerName, token);
        res.cookie(storedOptions.cookieName, token, { httpOnly: false, secure: storedOptions.secureFlag });
    },
    getFilter: function (options) {
        storedOptions = getValidOptions(options);
        return function (req, res, next) {

            if (req.method === 'OPTIONS') {
                next();
            }
            else if (req.method === 'GET' || req.method === 'HEAD') {
                if (req.headers[storedOptions.headerName] === 'Fetch') {
                    module.exports.setToken(res);
                    return res.status(200).end();
                }
                next();
            }
            else {
                var xsrfHeader = req.headers[storedOptions.headerName];
                var xsrfCookie = req.cookies[storedOptions.cookieName];
                if (!xsrfHeader || xsrfCookie !== xsrfHeader) {
                    // error, return 403
                    res.setHeader(storedOptions.headerName, 'Required');
                    if (req.accepts('json')) {
                        return res.status(403).json({message: errorMessage});
                    }
                    return res.status(403).end(errorMessage);
                }
                next();
            }
        };
    }
};
