var assert = require("chai").assert;
var Promise = require("./promise");

function PromiseWrapper() {
    var self = this;
    this.promise = new Promise(function (resolve, reject) {
        self.resolve = resolve;
        self.reject = reject;
    });
}


// ------------------------------------------------------------
//      Performances
// ------------------------------------------------------------
describe("Promise performances", function () {
    this.timeout(10000);
    function getPromiseChain(callback, length) {
        var promise, wrapper, k;
        wrapper = new PromiseWrapper();
        promise = wrapper.promise;
        for (k = 1; k < length; ++k) {
            promise = promise.then(function () {
                return Promise.resolve(0);
            });
        }
        promise = promise.then(callback);
        wrapper.resolve(1);
        return promise;
    }
    function testPromiseChainPerformances(length, count, expected, done) {
        var tsStart, current, promise;
        current = 0;
        function testCallback() {
            var tsEnd, span;
            ++current;
            if (current < count) {
                promise = getPromiseChain(testCallback, length);
            }
            else {
                tsEnd = Date.now();
                span = (tsEnd - tsStart) * 1000 / count / length;
                try {
                    assert.ok(span < expected, "Creating and resolving a " + length + "-promise long chain takes less than " + expected + " \u00b5s per promise. Duration = " + span + " \u00b5s");
                    done();
                }
                catch(error) {
                    done(error);
                }
            }
        }
        tsStart = Date.now();
        promise = getPromiseChain(testCallback, length);
    }
    describe("short promise chain", function () {
        var length = 5, count = 10000, expected = process.env.COVERAGE ? 50 : 5;
        this.slow(length * count * expected);
        it ("Creating and resolving " + count + " " + length + "-promise long chain must take less than " + (expected * count * length / 1000) + " ms (" + expected +" \u00b5s per promise)", function (done) {
            testPromiseChainPerformances(length, count, expected, done);
        });
    });
    describe("long promise chain", function () {
        var length = 100, count = 1000, expected = process.env.COVERAGE ? 100 : 10;
        this.slow(length * count * expected);
        it ("Creating and resolving " + count + " " + length + "-promise long chain must take less than " + (expected * count * length / 1000) + " ms (" + expected +" \u00b5s per promise)", function (done) {
            testPromiseChainPerformances(length, count, expected, done);
        });
    });
});
