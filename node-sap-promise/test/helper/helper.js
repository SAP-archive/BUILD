var helper = {};
module.exports = helper;

// Helper functions
toLog = function (x) {
    var k, n, p, log, t, comma;
    t = typeof x;
    switch (t) {
        case "string":
            log = '"' + x + '"';
            break;
        case "object":
            if (Array.isArray(x)) {
                log = "[ ";
                n = x.length;
                for (k = 0; k < n; ++k) {
                    if (k) {
                        log += ", ";
                    }
                    log += toLog(x[k]);
                }
                log += " ]";
            }
            else {
                log = x.constructor.name + " { ";
                p = Object.getOwnPropertyNames(x);
                n = p.length;
                for (k = 0; k < n; ++k) {
                    if (comma) {
                        log += ", ";
                    }
                    if ((x instanceof Error) && (p[k] === "stack")) {
                        continue;
                    }
                    log += p[k] +": " + toLog(x[p[k]]);
                    comma = true;
                }
                log += " }";
            }
            break;
        default:
            log = "" + x;
            break;
    }
    return log;
};
helper.toLog = toLog;

helper.testDone = function (done) {
    return function () {
        done();
    };
};

helper.testFailed = function (done) {
    return function (reason) {

        var msg  = "Test failed";
        if (reason.message) {
            msg += ": " + reason.message;
        }
        if (reason.stack) {
            msg += "\n----- reason stack -----\n" + reason.stack + "\n------------------------";
        }
        done(new Error(msg));
    };
};

helper.preventOnFulfilled = function () {
    throw new Error("onFulfilled must not be called");
};
