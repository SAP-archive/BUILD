"use strict";
var util = require("util");
var onFinished = require("on-finished");

var requestFields, responseFields, http;

var defaultOptions = {
    logMode: "response",
    logLevel: {
        request: "debug",
        info: "debug",          // 1xx
        success: "info",        // 2xx
        redirect: "info",       // 3xx
        clientError: "warn",    // 4xx
        error: "error",         // 5xx
        "404": "info"           // specific status code
    },
    request: {
        httpVersion: 0,
        method: 1,
        remoteAddress: 1,
        url: 1
    },
    response: {
        responseTime: 1,
        status: 1
    }
};

requestFields = {
    host: function (req) {
        return req.host;
    },
    httpVersion: function (req) {
        return req.httpVersion;
    },
    ip: function (req) {
        return req.ip;
    },
    method: function (req) {
        return req.method;
    },
    protocol: function (req) {
        return req.protocol;
    },
    remoteAddress: function (req) {
        return (req.connection && req.connection.remoteAddress);
    },
    url: function (req) {
        return (req.originalUrl || req.url);
    }
};

responseFields = {
    responseTime: function (req) {
        var start = req._startTime;
        return (start ? (Date.now() - start) : undefined);
    },
    status: function (req, res) {
        return res.statusCode;
    }
};

http = {
    defaultLogLevel: "info",
    requestLogger: requestLogger,
    requestFields: requestFields,
    getRequestCookies: function (req) {
        return req.cookies; // default parsed cookie access (e.g. using cookie-parser)
    },
    responseFields: responseFields,
    ignore: {   // define which headers and cookies should never be logged
        requestHeaders: {
            "authorization": 1,
            "cookie": 1
        },
        requestCookies: {

        },
        responseHeaders: {
            "set-cookie": 1
        },
        responseCookies: {

        }
    }
};
module.exports = http;

function normalizeHeaders(headers) {
    var outHeaders, k, n, keys, key;
    if (headers) {
        outHeaders = {};
        keys = Object.keys(headers);
        for (k = 0, n = keys.length; k < n; ++k) {
            key = keys[k];
            outHeaders[key.toLowerCase()] = headers[key];
        }
    }
    return outHeaders;
}

function extendOptions(target, options) {
    var k, n, key, keys, prop;
    if (typeof options !== "object") {
        return target;
    }
    keys = Object.keys(options);
    n = keys.length;
    for (k = 0; k < n; ++k) {
        key = keys[k];
        prop = options[key];
        if (typeof prop === "object") {
            target[key] = target[key] || {};
            if ((key === "requestHeaders") || (key === "responseHeaders")) {
                util._extend(target[key], normalizeHeaders(prop));
            }
            else {
                util._extend(target[key], prop);
            }
        }
        else {
            target[key] = prop;
        }
    }
    return target;
}

function getOptions(options, baseOptions) {
    var logOptions = {};
    options = options || {};
    if (!options.override) {
        baseOptions = baseOptions || defaultOptions;
        extendOptions(logOptions, baseOptions);
    }
    extendOptions(logOptions, options);
    return logOptions;
}

function getStatusType(status) {
    var type;
    if (status < 300) {
        if (status < 200) {
            type = "info";
        }
        else {
            type = "success";
        }
    }
    else {
        if (status < 400) {
            type = "redirect";
        }
        else if (status < 500) {
            type = "clientError";
        }
        else {
            type = "error";
        }
    }
    return type;
}

function getLogLevel(res, options) {
    var logLevel = options.logLevel, status = res.statusCode;
    if (logLevel) {
        return (logLevel[status] || logLevel[getStatusType(status)] || http.defaultLogLevel);
    }
    else {
        return http.defaultLogLevel;
    }
}

function isHeaderEnabled(header, options, logAll) {
    var setting = options[header];
    return logAll ? ((setting === undefined) || setting) : setting;
}

function getRequestHeaders(req, options) {
    var k, n, keys, key, reqHeaders, ignore, headers;
    if (!options) {
        return undefined;
    }
    var allHeaders = !!options["*"];
    reqHeaders = req.headers;
    ignore = http.ignore.requestHeaders;
    keys = allHeaders ? Object.keys(reqHeaders) : Object.keys(options);
    for (k = 0, n = keys.length; k < n; ++k) {
        key = keys[k];
        if (isHeaderEnabled(key, options, allHeaders) && !ignore[key]) {
            if (!headers) {
                headers = {};
            }
            headers[key] = reqHeaders[key];
        }
    }
    return headers;
}

function getRequestCookies(req, options) {
    var k, n, keys, key, reqCookies, ignore, cookies;
    if (!options) {
        return undefined;
    }

    reqCookies = http.getRequestCookies(req);
    ignore = http.ignore.requestCookies;
    keys = Object.keys(options);
    for (k = 0, n = keys.length; k < n; ++k) {
        key = keys[k];
        if (options[key] && !ignore[key]) {
            if (!cookies) {
                cookies = {};
            }
            cookies[key] = reqCookies[key];
        }
    }
    return cookies;
}

function getRequestFields(req, options) {
    var k, n, keys, key, field, reqOptions, headers, cookies, fields = {}, empty = true;

    // Fields
    reqOptions = options.request;
    if (reqOptions) {
        keys = Object.keys(reqOptions);
        for (k = 0, n = keys.length; k < n; ++k) {
            key = keys[k];
            if (reqOptions[key]) {
                empty = false;
                field = requestFields[key];
                if (typeof field === "function") {
                    fields[key] = field(req);
                }
                else {
                    fields[key] = field;
                }
            }
        }
    }

    // Headers
    headers = getRequestHeaders(req, options.requestHeaders);
    if (headers) {
        empty = false;
        fields.headers = headers;
    }

    // Cookies
    cookies = getRequestCookies(req, options.requestCookies);
    if (cookies) {
        empty = false;
        fields.cookies = cookies;
    }

    return (empty ? undefined : fields);
}

function getResponseHeaders(res, options) {
    var k, n, keys, key, resHeaders, ignore, headers;
    if (!options) {
        return undefined;
    }

    var allHeaders = !!options["*"];
    resHeaders = res._headers; // we should also patch ServerResponse.prototype.writeHead to ensure _headers is accurate
    ignore = http.ignore.responseHeaders;
    keys = allHeaders ? Object.keys(resHeaders) : Object.keys(options);
    for (k = 0, n = keys.length; k < n; ++k) {
        key = keys[k];
        if (isHeaderEnabled(key, options, allHeaders) && !ignore[key]) {
            if (!headers) {
                headers = {};
            }
            headers[key] = resHeaders[key];
        }
    }
    return headers;
}

function getResponseCookies() {
    // Not yet implemented
    return undefined;
}

function getResponseFields(req, res, options) {
    var k, n, keys, key, field, resOptions, headers, cookies, fields = {}, empty = true;

    // Fields
    resOptions = options.response;
    if (resOptions) {
        keys = Object.keys(resOptions);
        for (k = 0, n = keys.length; k < n; ++k) {
            key = keys[k];
            if (resOptions[key]) {
                empty = false;
                field = responseFields[key];
                if (typeof field === "function") {
                    fields[key] = field(req, res);
                }
                else {
                    fields[key] = field;
                }
            }
        }
    }

    // Headers
    headers = getResponseHeaders(res, options.responseHeaders);
    if (headers) {
        empty = false;
        fields.headers = headers;
    }

    // Cookies
    cookies = getResponseCookies(res, options.responseCookies);
    if (cookies) {
        empty = false;
        fields.cookies = cookies;
    }

    return (empty ? undefined : fields);
}

function requestLogger(startLogger, startOptions) {
    var logOptions, httpLogger;
    logOptions = getOptions(startOptions);
    if (logOptions.logMode === "both") {
        httpLogger = function (req, res, next) {
            function logRequest() {
                var options = httpLogger.options;
                var level = (options.logLevel && options.logLevel.request) || http.defaultLogLevel;
                var fields = {
                    req: getRequestFields(req, options)
                };
                httpLogger.logger.log(level, fields);
            }
            function logResponse() {
                var options = httpLogger.options;
                var level = getLogLevel(res, options);
                var fields = {
                    req: getRequestFields(req, options),
                    res: getResponseFields(req, res, options)
                };
                httpLogger.logger.log(level, fields);
            }
            req._startTime = Date.now();
            logRequest();
            onFinished(res, logResponse);
            next();
        };
    }
    else {
        httpLogger = function (req, res, next) {
            function logResponse() {
                var options = httpLogger.options;
                var level = getLogLevel(res, options);
                var fields = {
                    req: getRequestFields(req, options),
                    res: getResponseFields(req, res, options)
                };
                httpLogger.logger.log(level, fields);
            }
            req._startTime = Date.now();
            onFinished(res, logResponse);
            next();
        };
    }

    httpLogger.logger = startLogger;
    httpLogger.options = logOptions;
    return httpLogger;
}
