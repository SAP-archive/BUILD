var assert = require("chai").assert;
var logging = require("../index.js");
var mock = require("./mock");

function errorThrow(msg, code, Err) {
    Err = Err || Error;
    var err = new Err(msg);
    if (code) {
        err.code = code;
    }
    throw err;
}

describe("norman-logging", function () {
    var output = new mock.Output();

    beforeEach(function () {
       output.clear();
    });

    describe("log function", function () {
        var options = {
            appenders: {
                level: "trace",
                output: output
            }
        };
        var logger = new logging.Logger("test-logging", options);
        it("should log at the requested level", function () {
            var levels = [ "trace", "debug", "info", "warn", "error", "fatal" ];
            var message = "A simple log message";
            levels.forEach(function (level) {
                logger.log(level, message);
                var event = output.getLastEvent();
                assert.equal(event.severity, level.toUpperCase());
                assert.equal(event.level, logging.LogLevel[level]);
                assert.equal(event.msg, message);
                assert.equal(event.name, "test-logging");
            });
        });
    });

    describe("<logLevel> function", function () {
        var options = {
            appenders: {
                level: "trace",
                output: output
            }
        };
        var logger = new logging.Logger("test-logging", options);
        it("should log at the requested level", function () {
            var levels = [ "trace", "debug", "info", "warn", "error", "fatal" ];
            var message = "A simple log message";
            levels.forEach(function (level) {
                logger[level](message);
                var event = output.getLastEvent();
                assert.equal(event.severity, level.toUpperCase());
                assert.equal(event.level, logging.LogLevel[level]);
                assert.equal(event.msg, message);
                assert.equal(event.name, "test-logging");
            });
        });
    });

    describe("console output", function () {
        var options = {
            appenders: {
                level: "info",
                output: new logging.output.Console()
            }
        };
        var logger = new logging.Logger("test-logging", options);
        it("should nicely display errors", function () {
            try {
                errorThrow("Some error occurred", "ENOMAGIC", TypeError);
            }
            catch(err) {
                logger.error(err, "Oops");
            }
        });
    });

    describe("ConfigWatcher", function () {
        it ("should update logger when configuration changes", function () {
            var logManager = new logging.LogManager();
            var initialOutput = new mock.Output();
            var changedOutput = new mock.Output();
            var configWatcher = new logging.ConfigWatcher(logManager);
            logManager.configure(); // reset config
            logManager.addOutput("console", initialOutput);
            logManager.addAppender("*", {
                level: "debug",
                output: initialOutput
            });

            var logger = logManager.createLogger("test-logging");
            configWatcher.addWatch(logger);

            // Initially, output should go to initialOutput
            logger.debug("initial");
            assert.equal(initialOutput.length, 1);
            assert.equal(initialOutput.getLastEvent().msg, "initial");
            initialOutput.clear();

            // Change output in LogManager, logger should be updated
            logManager.configure(); // reset config
            logManager.addOutput("console", changedOutput);
            logManager.addAppender("*", {
                level: "debug",
                output: changedOutput
            });
            logManager.emit("configure");
            logger.debug("changed");
            assert.equal(initialOutput.length, 0);
            assert.equal(changedOutput.length, 1);
            assert.equal(changedOutput.getLastEvent().msg, "changed");
            changedOutput.clear();

            // Remove watch and change output in LogManager, logger should not be updated
            configWatcher.removeWatch(logger);
            logManager.configure(); // reset config
            logManager.addOutput("console", changedOutput);
            logManager.addAppender("*", {
                level: "debug",
                output: initialOutput
            });
            logManager.emit("configure");
            logger.debug("changed2");
            assert.equal(initialOutput.length, 0);
            assert.equal(changedOutput.length, 1);
            assert.equal(changedOutput.getLastEvent().msg, "changed2");
            changedOutput.clear();
            logger = logManager.createLogger("test-logging");
            logger.debug("new");
            assert.equal(initialOutput.length, 1);
            assert.equal(changedOutput.length, 0);
            assert.equal(initialOutput.getLastEvent().msg, "new");
        });
    });
});