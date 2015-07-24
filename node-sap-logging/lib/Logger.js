"use strict";
var os = require("os");
var util = require("util");
var inspect = util.inspect;

var LogLevel = require("./LogLevel");
var LogEvent = require("./LogEvent");

var _loggerId = 0;

var reservedFields = {
    err: 1,
    level: 1,
    msg: 1,
    name: 1,
    severity: 1,
    v: 1
};

var LOG_VERSION = 0;

/**
 * Logger class
 * @param {string} name Logger name
 * @param {object} [options]
 * @param {object} options.appenders List of appenders to attach to the logger
 * @param {object} options.serializers List of serializers for the logger
 * @param {*} options.field Field definition for the logger
 * @constructor
 * @property {number} id Logger unique identifier
 * @property {number|string} level Logger log level
 * @property {string} name Logger name
 */
function Logger(name, options) {
    var k, n, key, keys, value;
    options = options || {};
    this._level = LogLevel.NONE;
    this._id = (++_loggerId);
    this.fields = {
        name: name
    };
    this.appenders = [];
    this.serializers = {};

    keys = Object.keys(options);
    for (k = 0, n = keys.length; k < n; ++k) {
        key = keys[k];
        value = options[key];
        if (reservedFields[key]) {
            continue;
        }
        else if (key === "appenders" && value) {
            this.addAppenders(value);
        }
        else if (key === "serializers" && value) {
            this.addSerializers(value, true);
        }
        else {
            this.fields[key] = value;
        }
    }
    this.prepareFields();
}

module.exports = Logger;

Object.defineProperties(Logger.prototype, {
    id: {
        get: function () {
            return this._id;
        }
    },
    level: {
        get: function () {
            return this._level;
        },
        set: function (level) {
            switch (typeof level) {
                case "number":
                    this._level = level;
                    break;
                case "string":
                    if (LogLevel[level]) {
                        this._level = LogLevel[level];
                    }
                    else {
                        throw new TypeError("Invalid Log Level \"" + level + "\"");
                    }
                    break;
                default:
                    throw new TypeError("Invalid Log Level");
            }
        }
    },
    name: {
        get: function () {
            return this.fields.name;
        }
    }
});

/**
 * Checks whether the logger is enabled for a given level
 * @param {number|string} level
 * @returns {boolean}
 */
Logger.prototype.isEnabledFor = function (level) {
    if (typeof level === "string") {
        level = LogLevel[level] || Logger.defaultLogLevel;
    }
    return (this._level <= level);
};

Logger.prototype.toLog = function (field, value) {
    var serializer = this.serializers[field] || Logger.serializers[field];
    if (serializer) {
        value = serializer(value);
    }
    return value;
};

/**
 * Creates a new logger inheriting the current logger fields
 * @param {string} name Logger name
 * @param {object} [options] Logger options @see {@link Logger}
 * @returns {Logger}
 */
Logger.prototype.child = function (name, options) {
    if (typeof name !== "string") {
        options = name;
        name = this.fields.name;
    }
    var child = new Logger(name, options);
    child.addSerializers(this.serializers);
    child.addAppenders(this.appenders);
    return child;
};

Logger.prototype.addAppender = function (appender) {
    var level = appender.level;
    if (typeof level === "string") {
        level = LogLevel[level.toUpperCase()];
    }
    level = level || Logger.defaultLogLevel;
    if (level < this._level) {
        this._level = level;
    }
    appender.level = level;
    this.appenders.push(appender);
};

Logger.prototype.addAppenders = function (appenders) {
    var k, n;
    if (Array.isArray(appenders)) {
        for (k = 0, n = appenders.length; k < n; ++k) {
            this.addAppender(appenders[k]);
        }
    }
    else {
        this.addAppender(appenders);
    }
};

Logger.prototype.setAppenders = function (appenders) {
    this.appenders = [];
    this._level = LogLevel.NONE;
    this.addAppenders(appenders);
};

Logger.prototype.addSerializers = function (serializers, noPrepare) {
    var k, n, serializer, field, fields = Object.keys(serializers);
    for (k = 0, n = fields.length; k < n; ++k) {
        field = fields[k];
        serializer = serializers[field];
        if (typeof serializer !== "function") {
            throw new TypeError("Invalid serializer for field \"" + field + "\"");
        }
        this.serializers[field] = serializer;
    }
    if (!noPrepare) {
        this.prepareFields();
    }
};

Logger.prototype.prepareFields = function () {
    var preparedFields, k, n, key, keys;
    preparedFields = {};
    this.copyFields(preparedFields, this.fields, true);

    // Ensure that system fields are filled
    keys = Object.keys(Logger.systemFields);
    for (k = 0, n = keys.length; k < n; ++k) {
        key = keys[k];
        if (!preparedFields[key]) {
            preparedFields[key] = this.toLog(key, Logger.getSystemField(key));
        }
    }
    this.preparedFields = preparedFields;
};

Logger.prototype.copyFields = function (target, src, allFields) {
    var k, n, key, keys;
    keys = Object.keys(src);
    for (k = 0, n = keys.length; k < n; ++k) {
        key = keys[k];
        if (!allFields && reservedFields[key]) {
            continue;
        }
        if (src[key] !== undefined) {
            target[key] = this.toLog(key, src[key]);
        }
    }
};

// Logger static members
/**
 * Default log level
 */
Logger.defaultLogLevel = LogLevel.WARN;

/**
 * System fields to add to all log events
 */
Logger.systemFields = {
    hostname: os.hostname(),
    pid: process.pid,
    v: LOG_VERSION
};

Logger.getSystemField = function (key) {
    var field = Logger.systemFields[key];
    if (typeof field === "function") {
        return field();
    }
    else {
        return field;
    }
};

/**
 * Global serializers
 */
Logger.serializers = {};

Logger.serializers.err = function (err) {
    var obj, k, n, key, prop, keys, ignore;
    if (!err) {
        return err;
    }
    obj = {
        message: err.message || "",
        name: err.name,
        stack: err.stack
    };
    keys = Object.keys(err);
    ignore = Logger.serializers.err.ignore;
    for (k = 0, n = keys.length; k < n; ++k) {
        key = keys[k];
        if ((obj[key] !== undefined) || ignore[key]) {
            continue;
        }
        prop = err[key];
        if (prop instanceof Error) {
            obj[key] = Logger.serializers.err(prop);
        }
        else {
            obj[key] = prop;
        }
    }
    return obj;
};

Logger.serializers.err.ignore = {};

// Custom version of util.format to avoid costly apply and slice
var formatRegExp = /%[sdj%]/g;
function formatArgs(args, start) {
    var i, f, objects, str, z, len = args.length;
    start = start || 0;
    f = args[start];
    if (typeof f !== "string") {
        objects = [];
        for (i = start; i < args.length; ++i) {
            objects.push(inspect(args[i]));
        }
        return objects.join(" ");
    }

    i = start + 1;
    str = f.replace(formatRegExp, function(x) {
        if (x === "%%") {
            return "%";
        }
        if (i >= len) {
            return x;
        }
        switch (x) {
            case "%s": return ("" + args[i++]);
            case "%d": return args[i++];
            case "%j": return JSON.stringify(args[i++]);
            default:
                return x;
        }
    });
    for (z = args[i]; i < len; z = args[++i]) {
        if (z === null || typeof z !== "object") {
            str += " " + z;
        } else {
            str += " " + inspect(z);
        }
    }
    return str;
}

// args+start  := (err, fields, msgFormat, ...)
function log(logger, logLevel, args, start){
    var err, event, argLen, argStart, logFields, appender, appenders, k, n;
    // Check if event should be logged
    if (logger._level > logLevel) {
        return false;
    }
    appenders = logger.appenders;
    n = appenders.length;
    if (n === 0) {
        return false;
    }

    // Build Log Event
    event = new LogEvent(logger.preparedFields);
    err = args[start];
    if (err instanceof Error) {
        event.err = logger.toLog("err", err);
        logFields = args[++start];
    }
    else {
        logFields = err;
    }
    if (logFields && (typeof logFields === "object")){
        logger.copyFields(event, logFields);
        argStart = start + 2;
    }
    else {
        argStart = start + 1;
    }
    argLen = args.length;
    if (argLen < argStart) {    // No message argument
        if (event.err) {
            // When logging error, message defaults to the error message
            event.msg = err.message;
        }
        else {
            event.msg = "";
        }
    }
    else if (argLen > argStart) {
        event.msg = formatArgs(args, argStart - 1);
    }
    else {
        event.msg = args[argStart - 1];
    }

    // Add level and time
    event.level = logLevel;
    event.severity = LogLevel[logLevel];
    if (!event.time) {
        event.time = new Date();
    }

    // Send LogEvent to appenders
    for (k = 0; k < n; ++k) {
        appender = appenders[k];
        if (appender.level <= logLevel) {
            appender.output.log(event);
        }
    }
    return true;
}

/**
 * Log an event at the specified level
 * @param {number|string} logLevel
 * @param {Error} [err] Error object
 * @param {object} [fields] Log Event additional fields
 * @param {string} [message] Log message
 * @param {...*} [arg] Log message argument
 * @returns {boolean} true if log occurred (level greater than logger threshold)
 */
Logger.prototype.log = function (logLevel) {
    if (typeof logLevel === "string") {
        logLevel = LogLevel[logLevel] || Logger.defaultLogLevel;
    }
    // arguments := (logLevel, err, fields, msgFormat, ...)
    return log(this, logLevel, arguments, 1);
};

// Dedicated log functions
function makeLogFunction(logLevel) {
    return function () {
        // arguments := (err, fields, msgFormat, ...)
        return log(this, logLevel, arguments, 0);
    };
}
Logger.prototype.trace = makeLogFunction(LogLevel.TRACE);
Logger.prototype.debug = makeLogFunction(LogLevel.DEBUG);
Logger.prototype.info = makeLogFunction(LogLevel.INFO);
Logger.prototype.warn = makeLogFunction(LogLevel.WARN);
Logger.prototype.error = makeLogFunction(LogLevel.ERROR);
Logger.prototype.fatal = makeLogFunction(LogLevel.FATAL);

// Dedicated isEnabled functions
function makeIsEnabledFunction(logLevel) {
    return function () {
        // arguments := (err, fields, msgFormat, ...)
        return this.isEnabledFor(logLevel);
    };
}
/**
 * Checks is TRACE level is enabled
 */
Logger.prototype.isTraceEnabled = makeIsEnabledFunction(LogLevel.TRACE);
/**
 * Checks is DEBUG level is enabled
 */
Logger.prototype.isDebugEnabled = makeIsEnabledFunction(LogLevel.DEBUG);
/**
 * Checks is INFO level is enabled
 */
Logger.prototype.isInfoEnabled = makeIsEnabledFunction(LogLevel.INFO);
/**
 * Checks is WARN level is enabled
 */
Logger.prototype.isWarnEnabled = makeIsEnabledFunction(LogLevel.WARN);
/**
 * Checks is ERROR level is enabled
 */
Logger.prototype.isErrorEnabled = makeIsEnabledFunction(LogLevel.ERROR);
/**
 * Checks is FATAL level is enabled
 */
Logger.prototype.isFatalEnabled = makeIsEnabledFunction(LogLevel.FATAL);
