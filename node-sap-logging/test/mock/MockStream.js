var stream = require("stream");
var EventEmitter = require("events").EventEmitter;
var util = require("util");

function MockStream() {
    EventEmitter.call(this);
    this.buffer = [];
}
util.inherits(MockStream, EventEmitter);
module.exports = MockStream;

MockStream.prototype.write = function (chunk, encoding, callback) {
    this.buffer.push(chunk);
};

MockStream.prototype.end = function (chunk, encoding, callback) {
};

MockStream.prototype.clear = function () {
    this.buffer = [];
};
