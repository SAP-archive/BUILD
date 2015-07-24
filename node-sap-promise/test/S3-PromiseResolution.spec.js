var assert = require("chai").assert;
var Promise = require("./promise");

// Helper functions
var helper = require("./helper/helper.js");
helper.assert = assert;
var testFailed = helper.testFailed;
var preventOnFulfilled = helper.preventOnFulfilled;

// ------------------------------------------------------------
//      3 The Promise Resolution Procedure
// ------------------------------------------------------------
//
// The promise resolution procedure is an abstract operation taking as input a promise and a value, which we denote as [[Resolve]](promise, x).
// If x is a thenable, it attempts to make promise adopt the state of x, under the assumption that x behaves at least somewhat like a promise.
// Otherwise, it fulfills promise with the value x.
//
// This treatment of thenables allows promise implementations to interoperate, as long as they expose a Promises/A+-compliant then method.
// It also allows Promises/A+ implementations to “assimilate” nonconformant implementations with reasonable then methods.
//
// To run [[Resolve]](promise, x), perform the following steps:
//   3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.
//   3.2 If x is a promise, adopt its state:
//     3.2.1 If x is pending, promise must remain pending until x is fulfilled or rejected.
//     3.2.2 If/when x is fulfilled, fulfill promise with the same value.
//     3.2.3 If/when x is rejected, reject promise with the same reason.
//   3.3 Otherwise, if x is an object or function,
//     3.3.1 Let then be x.then.
//     3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
//     3.3.3 If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where:
//       3.3.3.1 If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
//       3.3.3.2 If/when rejectPromise is called with a reason r, reject promise with r.
//       3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
//       3.3.3.4 If calling then throws an exception e,
//         3.3.3.4.1 If resolvePromise or rejectPromise have been called, ignore it.
//         3.3.3.4.2 Otherwise, reject promise with e as the reason.
//     3.3.4 If then is not a function, fulfill promise with x.
//   3.4 If x is not an object or function, fulfill promise with x.
describe("3 The Promise resolution procedure", function () {
    // 3.1
    describe("3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.", function () {
        it("Promise resolves to itself", function (done) {
            var promise, resolver;
            resolver = {};
            promise = new Promise(function (resolve) {
                setTimeout(function () {
                    resolve(resolver.value);
                }, 10);
            });
            resolver.value = promise;
            promise.then(function () {
                assert.ok(false, "Resolving a promise to itself, onFulfilled is not called.");
            }, function (reason) {
                assert.ok(reason instanceof TypeError, "Resolving a promise to itself rejects the promise with a TypeError");
            }).then(done, testFailed(done));
        });
    });

    // 3.2
    describe("3.2 If x is a promise, adopt its state:", function () {
        describe("3.2.1 If x is pending, promise must remain pending until x is fulfilled or rejected.", function () {
            it("Resolving to a pending promise", function (done) {
                var promise, chainedPromise, settled;
                promise = new Promise(function () { }); // promise will remain pending
                chainedPromise = Promise.resolve(promise);
                chainedPromise.then(function () {
                    settled = true;
                    assert.ok(false, "Chained promise must remain pending until x is fulfilled or rejected");
                }, function () {
                    settled = true;
                    assert.ok(false, "Chained promise must remain pending until x is fulfilled or rejected");
                });
                setTimeout(function () {
                    assert.ok(!settled, "Chained promise is still pending");
                    done();
                }, 10);
            });
        });
        describe("3.2.2 If/when x is fulfilled, fulfill promise with the same value.", function () {
            it("Resolving to a fulfilled promise", function (done) {
                var promise, chainedPromise;
                promise = new Promise(function (resolve) {
                    resolve(1);
                });
                chainedPromise = Promise.resolve(promise);
                chainedPromise.then(function (value) {
                    assert.equal(value, 1, "onFulfilled is called with same value as promise");
                }, function () {
                    assert.ok(false, "Chained promise is fulfilled when x is fulfilled.");
                }).then(done, testFailed(done));
            });
            it("Resolving to an eventually fulfilled promise", function (done) {
                var promise, chainedPromise;
                promise = new Promise(function (resolve) {
                    setTimeout(function () {
                        resolve(1);
                    }, 10);
                });
                chainedPromise = Promise.resolve(promise);
                chainedPromise.then(function (value) {
                    assert.equal(value, 1, "onFulfilled is called with same value as promise");
                }, function () {
                    assert.ok(false, "Chained promise is fulfilled when x is fulfilled.");
                }).then(done, testFailed(done));
            });
            if ("result" in Promise.prototype) {
                it("Pathological promise", function (done) {
                    var error = new Error("rejected");
                    var p = new Promise(function (resolve) {
                        resolve(1);
                    });
                    Object.defineProperty(p, "_value", {
                        get: function () {
                            throw error;
                        }
                    });

                    new Promise(
                        function (resolve) {
                            resolve(p);
                        })
                        .then(preventOnFulfilled, function(reason) {
                            assert.equal(reason, error);
                        }).then(done, testFailed(done));
                });
            }
        });
        describe("3.2.3 If/when x is rejected, reject promise with the same reason.", function () {
            it("Resolving to a rejected promise", function (done) {
                var promise, chainedPromise, error;
                error = new Error("rejected");
                promise = new Promise(function (resolve, reject) {
                    reject(error);
                });
                chainedPromise = Promise.resolve(promise);
                chainedPromise.then(function () {
                    assert.ok(false, "Chained promise is rejected when x is rejected.");
                }, function (reason) {
                    assert.equal(reason, error, "onRejected is called with same reason as promise");
                }).then(done, testFailed(done));
            });
            it("Resolving to an eventually rejected promise", function (done) {
                var promise, chainedPromise, error;
                error = new Error("rejected");
                promise = new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        reject(error);
                    }, 30);
                });
                chainedPromise = Promise.resolve(promise);
                chainedPromise.then(function () {
                    assert.ok(false, "Chained promise is rejected when x is rejected.");
                }, function (reason) {
                    assert.equal(reason, error, "onRejected is called with same reason as promise");
                }).then(done, testFailed(done));
            });
        });
    });

    // 3.3
    describe("3.3 Otherwise, if x is an object or function:", function () {
        describe("3.3.1 Let then be x.then. / 3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.", function () {
            it ("Resolving to a throwing thenable", function (done) {
                var promise, thenable, error;
                error = new Error("throwing then");
                thenable = {};
                Object.defineProperty(thenable, "then", {
                    get: function () {
                        throw error;
                    }
                });
                promise = new Promise(function (resolve) {
                    resolve(thenable);
                });
                promise.then(function () {
                    assert.ok(false, "onFulfilled must not be called");
                }, function (reason) {
                    assert.equal(reason, error, "[[Resolve]](promise, x) rejects promise with error from Get(x, 'then')");
                }).then(done, testFailed(done));
            });

        });
        describe("3.3.3 If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where:", function () {
            it("x.then is called with x as this", function () {
                var thenCalled = false;
                var x = {};
                x.then = function () {
                    thenCalled = true;
                    assert.equal(this, x);
                };
                var p = new Promise(function (resolve) {
                    resolve(x);
                });
                assert(thenCalled);
            });
            it("x.then is called with resolvePromise as first argument", function (done) {
                var x = {};
                x.then = function (resolve) {
                    assert.isFunction(resolve, "resolve must be a function");
                    resolve(1);
                };
                var p = new Promise(function (resolve) {
                    resolve(x);
                }).then(function (value) {
                        assert.equal(value, 1);
                    }).then(done, testFailed(done));
            });
            it("x.then is called with rejectPromise as second argument", function (done) {
                var error = new Error("rejected");
                var x = {};
                x.then = function (resolve, reject) {
                    assert.isFunction(reject, "reject must be a function");
                    reject(error);
                };
                var p = new Promise(function (resolve) {
                    resolve(x);
                }).then(preventOnFulfilled, function (reason) {
                        assert.equal(reason, error);
                    }).then(done, testFailed(done));
            });
        });
        describe("3.3.4 If then is not a function, fulfill promise with x.", function () {
            it("[[Resolve]](promise, x) x.then undefined", function (done) {
                var promise, resolution;
                resolution = {
                    foo: "bar"
                };
                promise = new Promise(function (resolve) {
                    resolve(resolution);
                });
                promise.then(function (value) {
                    assert.equal(value, resolution, "[[Resolve]](promise, x) fulfills promise with x if x.then is undefined");
                }).then(done, testFailed(done));
            });
            it("[[Resolve]](promise, x) x.then non function", function (done) {
                var promise, resolution;
                resolution = {
                    then: 1
                };
                promise = new Promise(function (resolve) {
                    resolve(resolution);
                });
                promise.then(function (value) {
                    assert.equal(value, resolution, "[[Resolve]](promise, x) fulfills promise with x if x.then is not a function");
                }).then(done, testFailed(done));
            });
        });
    });

    //3.4
    describe("3.4 If x is not an object or function, fulfill promise with x.", function () {
        it("Resolve promise with non object/function", function (done) {
            var promise = new Promise(function (resolve) {
                resolve(1);
            });
            promise.then(function (value) {
                assert.equal(value, 1, "[[Resolve]](promise, x) fulfills promise with x if x is not an object or function");
            }).then(done, testFailed(done));
        });
    });
});


