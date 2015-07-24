"use strict";
var util = require("util");

function LogEvent(fields) {
    util._extend(this, fields);
}

module.exports = LogEvent;

Object.defineProperties(LogEvent.prototype, {
    JSON: {
        get: function () {
            if (this._json === undefined) {
                this._json = JSON.stringify(this);
            }
            return this._json;
        }
    }
});
