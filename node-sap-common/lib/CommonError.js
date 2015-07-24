'use strict';

var http = require('http');
var util = require('util');

var debugMode = false;
Error.stackTraceLimit = 20;

/**
 * @param {string} [message] error message, if not provided will default to http.STATUS_CODES[code]
 * @param {number|string} [code] optional error code, default to 500
 * @param {string} [target] optional error target
 * @param {Error} [inner] optional inner exceptions
 * @constructor
 */
function CommonError(message, code, target, inner) {
    var details, argType;
    Error.captureStackTrace(this);

    // Argument validation
    if ((message !== undefined) && (typeof message !== 'string')) {
        inner = target;
        target = code;
        code = message;
        message = undefined;
    }
    if (code !== undefined) {
        argType = typeof code;
        if ((argType !== 'number') && (argType !== 'string')) {
            inner = target;
            target = code;
            code = undefined;
        }
    }
    if ((target !== undefined) && (typeof target !== 'string')) {
        inner = target;
        target = undefined;
    }
    code = code || 500;
    this.code = code;
    this.message = message || http.STATUS_CODES[code] || code;
    if (target) {
        this.target = target;
    }
    if ((inner !== undefined) && (inner instanceof Error)) {
        this.inner = inner;
        details = [];
        while (inner instanceof Error) {
            details.push(inner);
            inner = inner.inner;
        }
        this.details = details;
    }
}
module.exports = CommonError;

util.inherits(CommonError, Error);
CommonError.prototype.name = 'CommonError';

CommonError.prototype.getErrorObject = function (excludeDetail) {
    var k, n, details, inner, error = {
        code: this.code,
        message: this.message
    };
    if (this.target) {
        error.target = this.target;
    }
    if (!excludeDetail && this.details) {
        details = [];
        n = this.details.length;
        for (k = 0; k < n; ++k) {
            inner = this.details[k];
            if (inner instanceof CommonError) {
                details.push(this.details[k].getErrorObject(true));
            }
            else if (debugMode) {
                // Technical errors must appear in client error only in debug mode
                details.push({
                    code: inner.code || 500,
                    message: inner.message
                });
            }
        }
        if (details.length) {
            error.details = details;
        }
    }
    return error;
};

CommonError.prototype.getInnerError = function () {
    var k, n, details, error, inner, fields, field, fk, fn, innererror = {
        stack: this.stack
    };
    if (this.details) {
        details = [];
        for (k = 0, n = this.details.length; k < n; ++k) {
            error = this.details[k];
            inner = {
                message: error.message,
                name: error.name,
                stack: error.stack
            };
            fields = Object.keys(error);
            for (fk = 0, fn = fields.length; fk < fn; ++fk) {
                field = fields[fk];
                if ((field !== 'message') && (field !== 'name')) {
                    inner[field] = error[field];
                }

            }
            details.push(inner);
        }
        innererror.details = details;
    }
    return innererror;
};

CommonError.prototype.toJSON = function () {
    return (debugMode ? this.debugError : this.clientError);
};


Object.defineProperties(CommonError.prototype, {
    clientError: {
        get: function () {
            return {
                error: this.getErrorObject()
            };
        }
    },
    debugError: {
        get: function () {
            var error = this.getErrorObject();
            error.innererror = this.getInnerError();
            return {
                error: error
            };
        }
    }
});

Object.defineProperty(CommonError, 'debugMode', {
    get: function () {
        return debugMode;
    },
    set: function (mode) {
        debugMode = !!mode;
    }
});

CommonError.declareError = function (name) {
    var CustomError = function () {
        CommonError.apply(this, Array.prototype.slice.call(arguments));
    };
    util.inherits(CustomError, CommonError);
    CustomError.prototype.name = name;
    return CustomError;
};
