var assert = require("chai").assert;
var Promise = require("./promise");

// Helper functions
var helper = require("./helper/helper.js");
helper.assert = assert;
var testFailed = helper.testFailed;
var preventOnFulfilled = helper.preventOnFulfilled;

function PromiseWrapper(promise) {
    var self = this;
    this.promise = new Promise(function (resolve, reject) {
        self.resolve = resolve;
        self.reject = reject;
    });
}

// ------------------------------------------------------------
//      1 Promise States
// ------------------------------------------------------------
//
//   1.1 When pending, a promise:
//     1.1.1 may transition to either the fulfilled or rejected state.
//   1.2 When fulfilled, a promise:
//     1.2.1 must not transition to any other state.
//     1.2.2 must have a value, which must not change.
//   1.3 When rejected, a promise:
//     1.3.1 must not transition to any other state.
//     1.3.2 must have a reason, which must not change.
//   1.4 Attempting to fulfill or reject a resolved promise has no effect (ES6 addition to promise A+)
describe("1 Promise states", function () {
    this.timeout(3000);

    // 1.1
    describe("1.1 When pending, a promise:", function () {
        describe("1.1.1 may transition to either the fulfilled or rejected state.", function () {
            it("Transition to fulfilled state", function (done) {
                var p = new Promise(function (resolve) {
                    resolve(1);
                });
                p.then(function () {
                    assert.ok("true", "Promise is fulfilled");
                }).then(done, testFailed(done));
            });
            it("Transition to rejected state", function (done) {
                var p = new Promise(function (resolve, reject) {
                    reject(new Error("rejected"));
                });
                p.then(preventOnFulfilled, function () {
                    assert.ok("true", "Promise is rejected");
                }).then(done, testFailed(done));
            });
        });
    });

    // 1.2
    describe("1.2 When fulfilled, a promise:", function () {
        describe("1.2.1 must not transition to any other state / 1.2.2 must have a value which must not change.", function () {
            it("Fulfill a fulfilled promise", function (done) {
                var wrapper, settled;
                wrapper = new PromiseWrapper();
                wrapper.promise.then(function (value) {
                    if (settled) {
                        assert.ok(false, "onFulfilled must be called once");
                    }
                    settled = true;
                    assert.equal(value, 1, "Promise is immutable once fulfilled");
                }, function () {
                    assert.ok(false, "onRejected must not be called");
                });
                wrapper.resolve(1);
                wrapper.resolve(2);
                setTimeout(done, 10);
            });
            it("Reject a fulfilled promise", function (done) {
                var wrapper, settled;
                wrapper = new PromiseWrapper();
                wrapper.promise.then(function (value) {
                    if (settled) {
                        assert.ok(false, "onFulfilled must be called once");
                    }
                    settled = true;
                    assert.equal(value, 1, "Promise is immutable once fulfilled");
                }, function () {
                    assert.ok(false, "onRejected must not be called");
                });
                wrapper.resolve(1);
                wrapper.reject(new Error("rejected"));
                setTimeout(done, 10);
            });
            it("Throw in constructor after fulfilling the promise", function (done) {
                var promise;
                promise = new Promise(function (resolve) {
                    resolve(1);
                    throw new Error("rejected");
                });
                promise.then(function (value) {
                    assert.equal(value, 1, "Promise is immutable once fulfilled");
                }, function () {
                    assert.ok(false, "onRejected must not be called");
                }).then(done, testFailed(done));
            });
        });
    });

    // 1.3
    describe("1.3 When rejected, a promise:", function () {
        describe("1.3.1 must not transition to any other state / 1.3.2 must have a reason which must not change", function () {
            it("Fulfill a rejected Promise", function (done) {
                var wrapper, settled, error;
                error = new Error("rejected");
                wrapper = new PromiseWrapper();
                wrapper.promise.then(preventOnFulfilled, function (reason) {
                    if (settled) {
                        assert.ok(false, "onRejected must be called once");
                    }
                    settled = true;
                    assert.equal(reason, error, "Promise is immutable once rejected");
                });
                wrapper.reject(error);
                wrapper.resolve(1);
                setTimeout(done, 10);
            });
            it("Reject a rejected Promise", function (done) {
                var wrapper, settled, error;
                error = new Error("rejected");
                wrapper = new PromiseWrapper();
                wrapper.promise.then(preventOnFulfilled, function (reason) {
                    if (settled) {
                        assert.ok(false, "onRejected must be called once");
                    }
                    settled = true;
                    assert.equal(reason, error, "Promise is immutable once rejected");
                });
                wrapper.reject(error);
                wrapper.reject(new Error("Another reason"));
                setTimeout(done, 10);
            });
            it("Throw in constructor after rejecting the promise", function (done) {
                var promise, settled, error;
                error = new Error("rejected");
                promise = new Promise(function (resolve, reject) {
                    reject(error);
                    throw new Error("Another reason");
                });
                promise.then(preventOnFulfilled, function (reason) {
                    if (settled) {
                        assert.ok(false, "onRejected must be called once");
                    }
                    settled = true;
                    assert.equal(reason, error, "Promise is immutable once rejected");
                }).then(done, testFailed(done));
            });
        });
    });

    // 1.4 Attempting to fulfill or reject a resolved promise has no effect
    describe("1.4 Attempting to fulfill or reject a resolved promise has no effect ", function () {
        it("Fulfill a promise resolved to an eventually fulfilled promise", function (done) {
            var w1, w2, settled;
            w1 = new PromiseWrapper();
            w2 = new PromiseWrapper();
            w2.promise.then(function (value) {
                if (settled) {
                    assert.ok(false, "onFulfilled must be called once");
                }
                settled = true;
                assert.equal(value, 1, "Promise is fulfilled with parent promise value");
            }, function () {
                assert.ok(false, "onRejected must not be called")
            });
            w2.resolve(w1.promise);
            w2.resolve(2);
            setTimeout(function() {
                assert.ok(!settled, "Resolved promise must remain pending until parent promise is settled");
                w1.resolve(1);
                setTimeout(done, 10);
            }, 10);
        });
        it("Reject a promise resolved to an eventually fulfilled promise", function (done) {
            var w1, w2, settled;
            w1 = new PromiseWrapper();
            w2 = new PromiseWrapper();
            w2.promise.then(function (value) {
                if (settled) {
                    assert.ok(false, "onFulfilled must be called once");
                }
                settled = true;
                assert.equal(value, 1, "Promise is fulfilled with upstream promise value");
            }, function () {
                assert.ok(false, "onRejected must not be called")
            });
            w2.resolve(w1.promise);
            w2.reject(new Error("rejected"));
            setTimeout(function() {
                assert.ok(!settled, "Resolved promise must remain pending until upstream promise is settled");
                w1.resolve(1);
                setTimeout(done, 10);
            }, 10);
        });
        it("Throw in promise constructor after resolving to an eventually fulfilled promise", function (done) {
            var w1, p2, settled;
            w1 = new PromiseWrapper();
            p2 = new Promise(function (resolve) {
                resolve(w1.promise);
                throw new Error("rejected");
            });
            p2.then(function (value) {
                if (settled) {
                    assert.ok(false, "onFulfilled must be called once");
                }
                settled = true;
                assert.equal(value, 1, "Promise is fulfilled with upstream promise value");
            }, function () {
                assert.ok(false, "onRejected must not be called")
            });
            setTimeout(function() {
                assert.ok(!settled, "Resolved promise must remain pending until parent promise is settled");
                w1.resolve(1);
                setTimeout(done, 10);
            }, 10);
        });
        it("Fulfill a promise resolved to an eventually rejected promise", function (done) {
            var w1, w2, settled, error;
            error = new Error("rejected");
            w1 = new PromiseWrapper();
            w2 = new PromiseWrapper();
            w2.promise.then(preventOnFulfilled, function (reason) {
                if (settled) {
                    assert.ok(false, "onRejected must be called once");
                }
                settled = true;
                assert.equal(reason, error, "Promise is rejected with parent promise reason");
            });
            w2.resolve(w1.promise);
            w2.resolve(2);
            setTimeout(function() {
                assert.ok(!settled, "Resolved promise must remain pending until parent promise is settled");
                w1.reject(error);
                setTimeout(done, 10);
            }, 10);
        });
        it("Reject a promise resolved to an eventually rejected promise", function (done) {
            var w1, w2, settled, error;
            error = new Error("rejected");
            w1 = new PromiseWrapper();
            w2 = new PromiseWrapper();
            w2.promise.then(preventOnFulfilled, function (reason) {
                if (settled) {
                    assert.ok(false, "onRejected must be called once");
                }
                settled = true;
                assert.equal(reason, error, "Promise is rejected with parent promise reason");
            });
            w2.resolve(w1.promise);
            w2.reject(new Error("another reason"));
            setTimeout(function() {
                assert.ok(!settled, "Resolved promise must remain pending until parent promise is settled");
                w1.reject(error);
                setTimeout(done, 10);
            }, 10);
        });
        it("Throw in promise constructor after resolving to an eventually rejected promise", function (done) {
            var w1, p2, settled, error;
            error = new Error("rejected");
            w1 = new PromiseWrapper();
            p2 = new Promise(function (resolve) {
                resolve(w1.promise);
                throw new Error("another reason");
            });
            p2.then(preventOnFulfilled, function (reason) {
                if (settled) {
                    assert.ok(false, "onRejected must be called once");
                }
                settled = true;
                assert.equal(reason, error, "Promise is rejected with parent promise reason");
            });
            setTimeout(function() {
                assert.ok(!settled, "Resolved promise must remain pending until parent promise is settled");
                w1.reject(error);
                setTimeout(done, 10);
            }, 10);
        });
    });

    // 1.5 promise implementation gives access to status and result
    describe("1.5 promise implementation gives access to status and result", function () {
        if ("id" in Promise.prototype) {
            it("Promise id", function () {
                var p = new Promise(function () {});
                var q = new Promise(function () {});
                assert.notEqual(p.id, q.id);
            });
        }
        if ("result" in Promise.prototype) {
            it("Promise result", function () {
                var p = new Promise(function () {});
                var error = new Error("rejected");
                assert.isUndefined(p.result);
                assert.equal(Promise.resolve(1).result, 1);
                assert.equal(Promise.reject(error).result, error);
            });
        }
        if ("status" in Promise.prototype) {
            it("Promise status", function () {
                var p = new Promise(function () {});
                assert.equal(p.status, Promise.PENDING);
                assert.equal(Promise.resolve(1).status, Promise.FULFILLED);
                assert.equal(Promise.reject(new Error("rejected")).status, Promise.REJECTED);
            });
        }
    });
});
