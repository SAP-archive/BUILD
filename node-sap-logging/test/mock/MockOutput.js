var EventEmitter = require("events").EventEmitter;
var util = require("util");

function MockOutput() {
    EventEmitter.call(this);
    this.buffer = [];
    this.events = [];
}
util.inherits(MockOutput, EventEmitter);
module.exports = MockOutput;

Object.defineProperties(MockOutput.prototype, {
    length: {
        get: function () {
            return this.events.length;
        }
    }
});


MockOutput.prototype.log = function (event) {
    this.buffer.push(event.JSON);
    this.events.push(event);
};

MockOutput.prototype.close = function () {
};

MockOutput.prototype.clear = function () {
    this.buffer = [];
    this.events = [];
};

MockOutput.prototype.getLastEvent = function () {
    return this.events[this.events.length - 1];
};
