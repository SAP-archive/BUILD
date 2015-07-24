"use strict";
var EOL = require("os").EOL;

function StreamOutput(stream, eol) {
    this.stream = stream;
    this.eol = (arguments.length < 2 ? EOL : eol);
}
module.exports = StreamOutput;

StreamOutput.prototype.log = function (event) {
    if (this.eol) {
        this.stream.write(event.JSON + this.eol);
    }
    else {
        this.stream.write(event.JSON);
    }
};

StreamOutput.prototype.close = function (done) {
    this.stream.end(done);
};
