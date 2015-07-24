var http = require("http");
var path = require("path");
var logging = require("../index.js");
//var expect = require("chai").expect;
//var mock = require("./mock");

var logManager = new logging.LogManager();
var logDirectory = path.join(__dirname, "../log");
logManager.configure({
    logDirectory: logDirectory,
    output: {
        stdout: { type: "console" },
        logfile: {
            type: "file",
            "path": "testlog_{pid}_{now:yyyyMMdd}.log"
        }
    },
    loggers: {
        "*": {
            stdout: "debug",
            logfile: "info"
        }
    }
});
var httpLogger = logManager.createLogger("http");
var httpOptions = {
    logMode: "response",
    request: {
        host: 1,
        httpVersion: 1,
        ip: 1,
        method: 1,
        protocol: 1,
        remoteAddress: 1,
        url: 1
    },
    response: {
        responseTime: 1,
        status: 1
    },
    requestHeaders: {
        "*": 1
    },
    responseHeaders: {
        "*": 1
    }
};
var requestLogger = logging.http.requestLogger(httpLogger, httpOptions);

function sayHello(req, res) {
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Custom-Response", "some custom header");
    res.end("Hello world!");
}

function requestHandler(req, res) {
    requestLogger(req, res, function () {
        sayHello(req, res);
    });
}


describe("http logging", function () {
    var server;
    before(function (done) {
        server = http.createServer(requestHandler);
        server.listen(9123, done);
    });
    after(function (done) {
        server.close(done)
    });

    describe("requestLogger", function () {
        this.timeout(10000);
        it("should log HTTP requests", function (done) {
            var request = http.get({
                port: 9123,
                path: "/",
                headers: {
                    Custom: "foo bar"
                },
                auth: "user:password"
            });
            request.on("error", done);
            request.on("response", function (response) {
                response.pipe(process.stdout);
                done();
            });
        });
    });
});
