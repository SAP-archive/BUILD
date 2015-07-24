var assert = require("chai").assert;
var Promise = require("./promise");

var PromiseTestData = require("./helper/PromiseTestData.js");
PromiseTestData.Promise = Promise;

// Helper functions
var helper = require("./helper/helper.js");
helper.assert = assert;
var testFailed = helper.testFailed;

function delayCheckFulfilled(value) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(value);
        }, 30);
    });
}
function delayCheckRejected(reason) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            reject(reason);
        }, 30);
    });
}
function getOnFulfilled(testCase, status, result) {
    if (status === "fulfilled") {
        return function (value) {
            assert.equal(value, result, testCase + " - promise must be fulfilled with expected value: " + toLog(result));
        };
    }
    else {
        return function (reason) {
            throw reason;
        };
    }
}
function getOnRejected(testCase, status, result) {
    if (status === "fulfilled") {
        return function (reason) {
            throw reason;
        };
    }
    else {
        return function (reason) {
            assert.equal(reason, result, testCase + " - promise must be rejected with expected reason: " + toLog(reason));
        };
    }
}


// ------------------------------------------------------------
//      8 Generic promise test
// ------------------------------------------------------------
describe("8 Generic promise test", function () {
    describe("8.1 then method", function () {
        var testPromises = PromiseTestData.createTestPromises();
        var debug = global.debugGenericTest;

        // Then test
        Object.getOwnPropertyNames(testPromises).forEach(function(groupName) {
            var group = testPromises[groupName];
            Object.getOwnPropertyNames(group.promises).forEach(function (testCase) {
                if (!debug || (testCase == debug)) {
                    it(testCase, function (done) {
                        var promise = Promise.resolve(1).then(function () {
                            return group.promises[testCase];
                        });
                        promise.then(delayCheckFulfilled, delayCheckRejected)
                            .then(getOnFulfilled(testCase, group.status, group.result), getOnRejected(testCase, group.status, group.result))
                            .then(done, testFailed(done));
                    });
                }
            });
        });
    });

    describe("8.2 Promise resolution", function () {
        var testPromises = PromiseTestData.createTestPromises();
        var debug = global.debugGenericTest;

        // Then test
        Object.getOwnPropertyNames(testPromises).forEach(function(groupName) {
            var group = testPromises[groupName];
            Object.getOwnPropertyNames(group.promises).forEach(function (testCase) {
                if (!debug || (testCase == debug)) {
                    it(testCase, function (done) {
                        var promise = new Promise(function (resolve) {
                            resolve(group.promises[testCase]);
                        });
                        promise.then(delayCheckFulfilled, delayCheckRejected)
                            .then(getOnFulfilled(testCase, group.status, group.result), getOnRejected(testCase, group.status, group.result))
                            .then(done, testFailed(done));
                    });
                }
            });
        });
    });
});
