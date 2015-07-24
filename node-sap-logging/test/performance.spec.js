var assert = require("chai").assert;
var logging = require("../index.js");
var mock = require("./mock");

var testCount = 10000;

function timeExec(testFunction, count) {
    var k, start, ms;
    count = count || testCount;
    start = Date.now();
    for (k = 0; k < count; ++k) {
        testFunction();
    }
    ms = (Date.now() - start) / count;
    ms *= 1000;
    return ms.toFixed(3);
}

describe("norman-logging performances", function () {
    var output = new mock.Output();
    var mockAppender = {
        level: "info",
        output: output
    };

    beforeEach(function () {
        mockAppender.output.clear();
    });

    it("overhead of not logging should be less than 1 µs", function () {
        var options = {
            appenders: mockAppender
        };
        var count = testCount * 10;
        var logger = new logging.Logger("test-logging", options);
        var time = timeExec(function () {
            logger.debug("A simple log message");
        }, count);
        assert.equal(output.buffer.length, 0, "no message should have been logged");
        console.log("overhead of not logging: " + time + " µs");
    });

    it("simple message logging should take less than 10 µs", function () {
        var options = {
            appenders: mockAppender
        };
        var logger = new logging.Logger("test-logging", options);
        var time = timeExec(function () {
            logger.info("A simple log message");
        });
        assert.equal(output.buffer.length, testCount, "messages should have been logged");
        console.log("simple message logging: " + time + " µs");
    });

    it("simple message, with extra fields logging should take less than 15 µs", function () {
        var options = {
            foo: "some context value",
            bar: "yet another field",
            appenders: mockAppender
        };
        var logger = new logging.Logger("test-logging", options);
        var time = timeExec(function () {
            logger.info("A simple log message");
        });
        assert.equal(output.buffer.length, testCount, "messages should have been logged");
        console.log("simple message with extra fields logging: " + time + " µs");
    });
});
