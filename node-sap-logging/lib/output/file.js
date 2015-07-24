"use strict";
var fs = require("fs");
var path = require("path");
var EOL = require("os").EOL;
var EventEmitter = require("events").EventEmitter;
var util = require("util");

var format = require("../format");

function FileOutput(options, logManager) {
    var self = this;
    var highWaterMark = 262000; // slightly less than 256 * 1024
    var filename = format.formatName(options.path) || "norman.log";
    filename = path.resolve(logManager.logDirectory, filename);
    EventEmitter.call(this);

    logManager.ensureLogDirectory();
    this.stream = fs.createWriteStream(filename, { flags: "a", encoding: "utf-8", highWaterMark: highWaterMark });
    this.stream.on("error", function (err) {
        self.emit("error", err);
    });
}
util.inherits(FileOutput, EventEmitter);
module.exports = FileOutput;

FileOutput.prototype.log = function (event) {
    this.stream.write(event.JSON);
    this.stream.write(EOL);
};

FileOutput.prototype.close = function (done) {
    this.stream.end(done);
};
