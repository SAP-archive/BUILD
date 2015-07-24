var assert = require("chai").assert;
var Promise = require("./promise");

var Thenable = require("./helper/Thenable.js");

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
//      2 The then Method
// ------------------------------------------------------------
//
// A promise must provide a then method to access its current or eventual value or reason.
//
// A promise’s then method accepts two arguments:
//
// promise.then(onFulfilled, onRejected)
//
//   2.1 Both onFulfilled and onRejected are optional arguments:
//     2.1.1 If onFulfilled is not a function, it must be ignored.
//     2.1.2 If onRejected is not a function, it must be ignored.
//   2.2 If onFulfilled is a function:
//     2.2.1 it must be called after promise is fulfilled, with promise’s value as its first argument.
//     2.2.2 it must not be called before promise is fulfilled.
//     2.2.3 it must not be called more than once.
//   2.3 If onRejected is a function,
//     2.3.1 it must be called after promise is rejected, with promise’s reason as its first argument.
//     2.3.2 it must not be called before promise is rejected.
//     2.3.3 it must not be called more than once.
//   2.4 onFulfilled or onRejected must not be called until the execution context stack contains only platform code.
//   2.5 onFulfilled and onRejected must be called as functions (i.e. with no this value).
//   2.6 then may be called multiple times on the same promise.
//     2.6.1 If/when promise is fulfilled, all respective onFulfilled callbacks must execute in the order of their originating calls to then.
//     2.6.2 If/when promise is rejected, all respective onRejected callbacks must execute in the order of their originating calls to then.
//   2.7 then must return a promise
//     promise2 = promise1.then(onFulfilled, onRejected);
//     2.7.1 If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x).
//     2.7.2 If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.
//     2.7.3 If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value.
//     2.7.4 If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason.
//  2.8 catch(onRejected) as shortcut for then(undefined, onRejected)
describe("2 The then method", function () {

    // 2.1
    describe("2.1 Both onFulfilled and onRejected are optional arguments", function (done) {
        it("2.1.1 If onFulfilled is not a function, it must be ignored.", function () {
            Promise.resolve(1).then().then(function (value) {
                assert.equal(value, 1, "undefined onFulfilled has been ignored");
                return 1;
            }).then(2).then(function (value) {
                assert.equal(value, 1, "non function onFulfilled has been ignored");
            }).then(done, testFailed(done));
        });
        it("2.1.2 If onRejected is not a function, it must be ignored.", function () {
            Promise.reject(new Error("rejected")).then().then(preventOnFulfilled, function (reason) {
                assert.equal(reason, error, "undefined onRejected has been ignored");
                throw error;
            }).then(2, 2).then(preventOnFulfilled, function (reason) {
                assert.equal(reason, error, "non function onRejected has been ignored");
            }).then(done, testFailed(done));
        });
    });

    // 2.2
    describe("2.2 If onFulfilled is a function:", function () {
        it("2.2.1 it must be called after promise is fulfilled, with promise’s value as its first argument.", function (done) {
            var thenCalled = false;
            Promise.resolve(1).then(function (value) {
                thenCalled = true;
                assert.equal(value, 1);
            });
            setTimeout(function () {
                assert.ok(thenCalled);
                done();
            }, 10);
        });
        it("2.2.2 it must not be called before promise is fulfilled.", function (done) {
            var fulfilled = false;
            var wrapper = new PromiseWrapper();
            wrapper.promise.then(function () {
                assert.ok(fulfilled);
            }).then(done, testFailed(done));
            setTimeout(function () {
                fulfilled = true;
                wrapper.resolve(1);
            }, 10);
        });
        it("2.2.3 it must not be called more than once.", function (done) {
            var wrapper, thenCalled;
            wrapper = new PromiseWrapper();
            wrapper.promise.then(function () {
                assert.ok(!thenCalled);
                thenCalled = true;
            }).then(done, testFailed(done));
            wrapper.resolve(1);
            wrapper.resolve(2);
        });
    });

    // 2.3
    describe("2.3 If onRejected is a function:", function () {
        it("2.3.1 it must be called after promise is rejected, with promise’s reason as its first argument.", function (done) {
            var thenCalled = false;
            var error = new Error("rejected");
            Promise.reject(error).then(preventOnFulfilled, function (reason) {
                thenCalled = true;
                assert.equal(reason, error);
            });
            setTimeout(function () {
                assert.ok(thenCalled);
                done();
            }, 10);
        });
        it("2.3.2 it must not be called before promise is rejected.", function (done) {
            var rejected = false;
            var wrapper = new PromiseWrapper();
            wrapper.promise.then(preventOnFulfilled, function () {
                assert.ok(rejected);
            }).then(done, testFailed(done));
            setTimeout(function () {
                rejected = true;
                wrapper.reject(new Error("rejected"));
            }, 10);
        });
        it("2.3.3 it must not be called more than once.", function (done) {
            var wrapper, thenCalled;
            wrapper = new PromiseWrapper();
            wrapper.promise.then(preventOnFulfilled, function () {
                assert.ok(!thenCalled);
                thenCalled = true;
            }).then(done, testFailed(done));
            wrapper.reject(new Error("rejected"));
            wrapper.reject(new Error("another error"));
        });
    });

    // 2.4
    describe("2.4 onFulfilled or onRejected must not be called until the execution context stack contains only platform code.", function (done) {
        it("onFulfilled context stack", function (done) {
            var settled, scopeEnd;
            Promise.resolve(1).then(function () {
                settled = true;
                assert.ok(scopeEnd);
            }).then(done, testFailed(done));
            assert.ok(!settled);
            scopeEnd = true;
        });
        it("onRejected context stack", function (done) {
            var settled, scopeEnd;
            Promise.reject(1).then(preventOnFulfilled, function () {
                settled = true;
                assert.ok(scopeEnd);
            }).then(done, testFailed(done));
            assert.ok(!settled);
            scopeEnd = true;
        });
    });

    // 2.5
    describe("2.5 onFulfilled and onRejected must be called as functions (i.e. with no this value).", function (done) {
        it("onFulfilled this value", function (done) {
            Promise.resolve(1).then(function () {
                assert.ok((this === undefined) || (this === global) || (this === window));
            }).then(done, testFailed(done));
        });
        it("onRejected this value", function (done) {
            Promise.reject(new Error("rejected")).then(preventOnFulfilled, function () {
                assert.ok((this === undefined) || (this === global) || (this === window));
            }).then(done, testFailed(done));
        });
    });

    // 2.6
    describe("2.6 then may be called multiple times on the same promise.", function () {
        it ("2.6.1 If/when promise is fulfilled, all respective onFulfilled callbacks must execute in the order of their originating calls to then.", function (done) {
            var s1, s2;
            var p = Promise.resolve(1);
            p.then(function () {
                s1 = true;
                assert.ok(!s2);
            });
            p.then(function () {
                assert.ok(s1);
                s2 = true;
            }).then(done, testFailed(done));
        });
        it ("2.6.2 If/when promise is rejected, all respective onRejected callbacks must execute in the order of their originating calls to then.", function (done) {
            var s1, s2;
            var p = Promise.reject(new Error("rejected"));
            p.then(preventOnFulfilled, function () {
                s1 = true;
                assert.ok(!s2);
            });
            p.then(preventOnFulfilled, function () {
                assert.ok(s1);
                s2 = true;
            }).then(done, testFailed(done));
        });
    });

    // 2.7
    describe("2.7 then must return a promise", function () {
        assert.ok(Promise.resolve(1).then(function () {
        }) instanceof Promise, "then must return a promise");
        describe("2.7.1 If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x).", function () {
            it("onFulfilled returns a value", function (done) {
                Promise.resolve(0).then(function () {
                    return 1;
                }).then(function (value) {
                    assert.equal(value, 1, "then promise is resolved with value returned by onFulfilled");
                }).then(done, testFailed(done));
            });
            it("onRejected returns a value", function (done) {
                var error = new Error("rejected");
                Promise.reject(error).then(preventOnFulfilled, function () {
                    return 1;
                }).then(function (value) {
                    assert.equal(value, 1, "then promise is resolved with value returned by onRejected");
                }).then(done, testFailed(done));
            });
            it("onFulfilled returns a fulfilled promise", function (done) {
                Promise.resolve(0).then(function () {
                    return Promise.resolve(1);
                }).then(function (value) {
                    assert.equal(value, 1, "then promise is resolved with the promise returned by onFulfilled");
                }).then(done, testFailed(done));
            });
            it("onFulfilled returns a rejected promise", function (done) {
                var error = new Error("rejected");
                Promise.resolve(0).then(function () {
                    return Promise.reject(error);
                }).then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error, "then promise is resolved with the promise returned by onFulfilled");
                }).then(done, testFailed(done));
            });
            it("onRejected returns a fulfilled promise", function (done) {
                promise = Promise.reject(new Error("rejected")).then(preventOnFulfilled, function () {
                    return Promise.resolve(1);
                }).then(function (value) {
                    assert.equal(value, 1, "then promise is resolved with promise returned by onRejected");
                }).then(done, testFailed(done));
            });
            it("onRejected returns a rejected promise", function (done) {
                var error = new Error("rejected");
                promise = Promise.reject(new Error("some reason")).then(preventOnFulfilled, function () {
                    return Promise.reject(error);
                }).then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error, "then promise is resolved with promise returned by onRejected");
                }).then(done, testFailed(done));
            });
            it("onFulfilled returns an eventually fulfilled thenable object", function (done) {
                Promise.resolve(0).then(function () {
                    var w = new Thenable(function () {
                        setTimeout(function () {
                            w.resolve(1);
                        }, 0);
                    });
                    return w;
                }).then(function (value) {
                    assert.equal(value, 1, "then promise is resolved with eventually fulfilled thenable returned by onFulfilled");
                }).then(done, testFailed(done));
            });
            it("onFulfilled returns an eventually rejected thenable object", function (done) {
                var error = new Error("rejected");
                Promise.resolve(0).then(function () {
                    var w = new Thenable(function () {
                        setTimeout(function () {
                            w.reject(error);
                        }, 0);
                    });
                    return w;
                }).then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error, "then promise is resolved with eventually rejected thenable returned by onFulfilled");
                }).then(done, testFailed(done));
            });
            it("onRejected returns an eventually fulfilled thenable object", function (done) {
                Promise.reject(new Error()).then(preventOnFulfilled, function () {
                    var w = new Thenable(function () {
                        setTimeout(function () {
                            w.resolve(1);
                        }, 0);
                    });
                    return w;
                }).then(function (value) {
                    assert.equal(value, 1, "then promise is resolved with eventually fulfilled thenable returned by onRejected");
                }).then(done, testFailed(done));
            });
            it("onRejected returns an eventually rejected thenable object", function (done) {
                var error = new Error("rejected");
                Promise.reject(new Error()).then(preventOnFulfilled, function () {
                    var w = new Thenable(function () {
                        setTimeout(function () {
                            w.reject(error);
                        }, 0);
                    });
                    return w;
                }).then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error, "then promise is resolved with eventually rejected thenable returned by onRejected");
                }).then(done, testFailed(done));
            });
            it("onFulfilled returns a thenable eventually fulfilled to an eventually fulfilled thenable object", function (done) {
                Promise.resolve(0).then(function () {
                    var t = new Thenable(function () {
                        setTimeout(function () {
                            t.resolve(w);
                        }, 0);
                    });
                    var w = new Thenable(function () {
                        setTimeout(function () {
                            w.resolve(1);
                        }, 0);
                    });
                    return t;
                }).then(function (value) {
                    assert.equal(value, 1, "then promise is resolved with thenable eventually fulfilled to an eventually fulfilled thenable returned by onFulfilled");
                }).then(done, testFailed(done));
            });
            it("onFulfilled returns a thenable eventually fulfilled to an eventually rejected thenable object", function (done) {
                var error = new Error("rejected");
                Promise.resolve(0).then(function () {
                    var t = new Thenable(function () {
                        setTimeout(function () {
                            t.resolve(w);
                        }, 0);
                    });
                    var w = new Thenable(function () {
                        setTimeout(function () {
                            w.reject(error);
                        }, 0);
                    });
                    return t;
                }).then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error, "then promise is resolved with thenable eventually fulfilled to an eventually rejected thenable returned by onFulfilled");
                }).then(done, testFailed(done));
            });
            it("onRejected returns a thenable eventually fulfilled to an eventually fulfilled thenable object", function (done) {
                Promise.reject(new Error()).then(preventOnFulfilled, function () {
                    var t = new Thenable(function () {
                        setTimeout(function () {
                            t.resolve(w);
                        }, 0);
                    });
                    var w = new Thenable(function () {
                        setTimeout(function () {
                            w.resolve(1);
                        }, 0);
                    });
                    return t;
                }).then(function (value) {
                    assert.equal(value, 1, "then promise is resolved with thenable eventually fulfilled to an eventually fulfilled thenable returned by onRejected");
                }).then(done, testFailed(done));
            });
            it("onRejected returns a thenable eventually fulfilled to an eventually rejected thenable object", function (done) {
                var error = new Error("rejected");
                Promise.reject(new Error()).then(preventOnFulfilled, function () {
                    var t = new Thenable(function () {
                        setTimeout(function () {
                            t.resolve(w);
                        }, 0);
                    });
                    var w = new Thenable(function () {
                        setTimeout(function () {
                            w.reject(error);
                        }, 0);
                    });
                    return t;
                }).then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error, "then promise is resolved with thenable eventually fulfilled to an eventually rejected thenable returned by onRejected");
                }).then(done, testFailed(done));
            });
        });
        describe("2.7.2 If either onFulfilled or onRejected throws an exception e, promise2 must be rejected with e as the reason.", function () {
            it("onFulfilled throws an exception", function (done) {
                var error = new Error("callback error");
                Promise.resolve(0).then(function () {
                    throw error;
                }).then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error, "then promise is rejected with exception thrown by onFulfilled");
                }).then(done, testFailed(done));
            });
            it("onRejected throws an exception", function (done) {
                var error = new Error("callback error");
                Promise.reject(new Error("rejected")).then(undefined, function () {
                    throw error;
                }).then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error, "then promise is rejected with exception thrown by onRejected");
                }).then(done, testFailed(done));
            });
        });
        describe("2.7.3 If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value.", function () {
            it("onFulfilled is not a function", function (done) {
                Promise.resolve(1).then(17).then(function (value) {
                    assert.equal(value, 1, "non-function onFulfilled argument is ignored");
                }).then(done, testFailed(done));
            });
        });
        describe("2.7.4 If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason.", function () {
            it("onRejected is not a function", function (done) {
                var error = new Error("rejected");
                Promise.reject(error).then(preventOnFulfilled, 17).then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error, "non-function onRejected argument is ignored");
                }).then(done, testFailed(done));
            });
        });
    });

    // 2.8
    describe("2.8 catch(onRejected) as shortcut for then(undefined, onRejected)", function (done) {
        it("catch method", function () {
            var error = new Error("rejected");
            Promise.reject(error)["catch"](function (reason) {
                assert.equal(reason, error, "promise rejection reason is passed to catch handler");
            }).then(done, testFailed(done));
        });
    });

});
