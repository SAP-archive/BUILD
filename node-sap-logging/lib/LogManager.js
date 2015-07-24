"use strict";
var path = require("path");
var fs = require("fs");
var EventEmitter = require("events").EventEmitter;
var util = require("util");

var logOutput = require("./output");
var Logger = require("./Logger");
var LogLevel = require("./LogLevel");

var SHUTDOWN_TIMEOUT = 10;

// Initialize LogManager with a default debug config
var defaultConfig = {
    "output": {
        "stdout": { "type": "console" }
    },
    "loggers": {
        "*": { "stdout": "debug" }
    }
};

function ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

function LogManager() {
    EventEmitter.call(this);
    this.configure(defaultConfig);
}
util.inherits(LogManager, EventEmitter);
module.exports = LogManager;

LogManager.prototype.configure = function (config, preserveExisting) {
    var k, n, keys, key, cwd, logDirectory;
    config = config || {};

    if (!preserveExisting) {
        this.output = {};
        this.appenders = {};
        this.defaultAppenders = [];
    }

    cwd = config.cwd || process.cwd();
    logDirectory = config.logDirectory || "./logs";
    this.logDirectory = path.resolve(cwd, logDirectory);

    if (config.output) {
        keys = Object.keys(config.output);
        n = keys.length;
        for (k = 0; k < n; ++k) {
            key = keys[k];
            this.addOutput(key, this.createOutput(config.output[key]));
        }
    }

    if (config.loggers) {
        keys = Object.keys(config.loggers);
        n = keys.length;
        for (k = 0; k < n; ++k) {
            key = keys[k];
            this.createAppenders(key, config.loggers[key]);
        }
    }
    this.emit("configure");
};

LogManager.prototype.ensureLogDirectory = function () {
    ensureDirectory(this.logDirectory);
};

LogManager.prototype.shutdown = function () {
    var timeoutId, self = this, outputs = this.output, keys = Object.keys(outputs), count = keys.length, settled = 0, resolved = {};

    // Avoid dependency on Promise lib
    function getCloseDone(name) {
        return function () {
            if (!resolved[name]) {
                resolved[name] = true;
                ++settled;
                if (settled >= count) {
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    self.emit("close");
                }
            }
        };
    }
    function closeOutput(key) {
        var output = outputs[key], done = getCloseDone(key);
        if (output && (typeof output.close === "function")) {
            try {
                if (output.close.length === 1) {
                    output.close(done);
                }
                else {
                    output.close();
                    done();
                }
            }
            catch (err) {
                done();
            }
        }
        else {
            done();
        }
    }
    keys.forEach(closeOutput);
    timeoutId = setTimeout(function () {
        timeoutId = undefined;
        keys.forEach(function (key) {
            getCloseDone(key)();
        });
    }, SHUTDOWN_TIMEOUT * 1000);
};

LogManager.prototype.createLogger = function (name, options) {
    var loggerOptions = {
        appenders: this.getAppenders(name)
    };

    util._extend(loggerOptions, options);
    return new Logger(name, loggerOptions);
};

LogManager.prototype.addOutput = function (name, output) {
    if (name && output) {
        this.output[name] = output;
    }
};

LogManager.prototype.createOutput = function (options) {
    var output, Ctor;
    if (typeof options.type === "object") {
        // already instantiated log output passed
        return options.type;
    }
    switch (options.type) {
        case "console":
            output = new logOutput.Console(options, this);
            break;
        case "file":
            output = new logOutput.File(options, this);
            break;
        default:
            Ctor = require(options.type);
            output = new Ctor(options, this);
    }
    return output;
};

LogManager.prototype.createAppenders = function (name, options) {
    var k, n, keys, key;
    keys = Object.keys(options);
    n = keys.length;
    for (k = 0; k < n; ++k) {
        key = keys[k];
        if (this.output[key]) {
            this.addAppender(name, {
                level: LogLevel[options[key]] || LogLevel.NONE,
                output: this.output[key]
            });
        }
    }
};

LogManager.prototype.addAppender = function (name, appender) {
    if (typeof appender !== "object") {
        throw new TypeError("Invalid Appender");
    }
    if (!name || name === "*") {
        this.defaultAppenders.push(appender);
    }
    else {
        if (!this.appenders[name]) {
            this.appenders[name] = [];
        }
        this.appenders[name].push(appender);
    }
};

LogManager.prototype.getAppenders = function (name) {
    var appenders;
    while (!appenders && name) {
        appenders = this.appenders[name];
        name = this.getParent(name);
    }
    if (!appenders) {
        appenders = this.defaultAppenders;
    }
    return appenders;
};

LogManager.prototype.getParent = function (name) {
    var pos;
    if (!name) {
        return null;
    }
    pos = name.lastIndexOf(".");
    if (pos === -1) {
        return null;
    }
    return name.substring(0, pos);
};
