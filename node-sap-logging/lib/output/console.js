"use strict";
var EventEmitter = require("events").EventEmitter;
var util = require("util");

var LogLevel = require("../LogLevel");
var format = require("../format");
var stdProperties = {
    err: 1,
    hostname: 1,
    level: 1,
    msg: 1,
    name: 1,
    pid: 1,
    req: 1,
    res: 1,
    severity: 1,
    time: 1,
    v: 1
};

var errProperties = {
    name: 1,
    message: 1,
    stack: 1
};

function toInt(num) {
    if (num) {
        num = parseInt(num, 10);
        if (!isNaN(num)) {
            return num;
        }
    }
    return undefined;
}
var workerId = toInt(process.env.NORMAN_WORKER_ID);
var pid = process.pid;

function ConsoleOutput() {
    EventEmitter.call(this);
}
util.inherits(ConsoleOutput, EventEmitter);
module.exports = ConsoleOutput;

ConsoleOutput.prototype.log = function (event) {
    var disp = getDisplay(event), output = getOutput(event);
    if (disp.detail) {
        output(disp.message, JSON.stringify(disp.detail));
    }
    else {
        output(disp.message);
    }
    if (event.err && event.err.stack) {
        output(event.err.stack);
    }
};

ConsoleOutput.prototype.close = function (done) {
    process.stdout.write("", function () {
        process.stderr.write("", done);
    });
};

function getDisplay(event) {
    var k, n, key, keys, errDetail, detail, hasDetail, err, httpDetail, disp = {};
    disp.message = format.formatDate(event.time, "HH:mm:ss.fff ");
    if (workerId) {
        disp.message += "(" + pid + ": worker #" + workerId + ") ";
    }
    disp.message += event.name + " [" + event.severity + "] ";
    detail = {};
    hasDetail = false;
    if (event.req) {
        disp.message += event.req.method + " " + event.req.url + " ";
        httpDetail = util._extend({}, event.req);
        delete httpDetail.method;
        delete httpDetail.url;
        if (Object.keys(httpDetail).length > 0) {
            detail.reqDetail = httpDetail;
            hasDetail = true;
        }
    }
    if (event.msg) {
        disp.message += event.msg + " ";
    }
    err = event.err;
    if (err) {
        errDetail = {};
        if (err.message === event.msg) {
            disp.message += "(" + err.name + ") ";
        }
        else {
            errDetail.message = err.message || "";
            errDetail.name = err.name;
            hasDetail = true;
        }
        keys = Object.keys(err);
        for (k = 0, n = keys.length; k < n; ++k) {
            key = keys[k];
            if (errProperties[key]) {
                continue;
            }
            errDetail[key] = err[key];
            hasDetail = true;
        }
        if (hasDetail) {
            detail.err = errDetail;
        }
    }

    if (event.res) {
        disp.message += event.res.status;
        if (event.res.responseTime) {
            disp.message += " (" + event.res.responseTime + " ms)";
        }
        disp.message += " ";
        httpDetail = util._extend({}, event.res);
        delete httpDetail.status;
        delete httpDetail.responseTime;
        if (Object.keys(httpDetail).length > 0) {
            detail.resDetail = httpDetail;
            hasDetail = true;
        }
    }
    keys = Object.keys(event);
    for (k = 0, n = keys.length; k < n; ++k) {
        key = keys[k];
        if (stdProperties[key]) {
            continue;
        }
        detail[key] = event[key];
        hasDetail = true;
    }
    if (hasDetail) {
        disp.detail = detail;
    }
    return disp;
}

function getOutput(event) {
    var level = event.level;
    if (level >= LogLevel.ERROR) {
        return console.error;
    }
    else if (level >= LogLevel.WARN) {
        return console.warn;
    }
    else if (level >= LogLevel.INFO) {
        return console.info;
    }
    return console.log;
}
