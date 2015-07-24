var assert = require("chai").assert;
var Promise = require("./promise");

// Helper functions
var helper = require("./helper/helper.js");
helper.assert = assert;
var testFailed = helper.testFailed;
var testDone = helper.testDone;
var preventOnFulfilled = helper.preventOnFulfilled;

var Thenable = require("./helper/Thenable.js");
var CustomThenables = require("./helper/CustomThenables.js");
var ValueThenable = CustomThenables.ValueThenable;
var ThrowingThenable = CustomThenables.ThrowingThenable;
var ThrowingThenProperty = CustomThenables.ThrowingThenProperty;

// ------------------------------------------------------------
//      7 Promise constructor enhancement
// ------------------------------------------------------------
describe("7 Promise constructor enhancements", function () {
    describe("7.1 Promise.defer", function () {
        it("Creates a Promise wrapper equivalent to Q.defer()", function () {
            var deferred = Promise.defer();
            assert.ok(deferred.promise instanceof Promise);
            assert.equal(typeof deferred.resolve, "function");
            assert.equal(typeof deferred.reject, "function");
        });
    });
    describe("7.2 Promise.waitAll", function () {
        it("requires an array argument", function () {
            try {
                Promise.waitAll();
                assert.ok(false, "Promise.waitAll requires an array argument.");
            }
            catch (error) {
                assert.ok(error instanceof TypeError, "Promise.waitAll requires an array argument.");
            }
        });
        it("returns a Promise", function () {
            assert(Promise.waitAll([]) instanceof Promise);
        });
        it("must be rejected after all promised are settled if one promise is rejected", function (done) {
            var error = new Error("rejected");
            var pending = Promise.defer();
            var rejected = Promise.reject(error);
            var waitAll = Promise.waitAll([ rejected, pending.promise ]);
            waitAll.then(preventOnFulfilled, function (reason) {
                assert.isObject(reason.detail, "when Promise.waitAll is rejected, the reason must contain a detail object.");
                assert.equal(reason.detail.failCount, 1);
                assert.isArray(reason.detail.errors);
                assert.equal(reason.detail.errors[0], error);
                assert.isUndefined(reason.detail.errors[1]);
                assert.isArray(reason.detail.results);
                assert.isUndefined(reason.detail.results[0]);
                assert.equal(reason.detail.results[1], 1);
            })
                .then(done, testFailed(done));
            rejected.catch(function () {
                setTimeout(function () {
                    if (waitAll.status !== Promise.PENDING) {
                        pending.reject(new Error("Promise.waitAll must remain pending until all promises are settled"));
                    }
                    else {
                        pending.resolve(1);
                    }
                }, 15);
            })
        });
        it("must be rejected when all promised are rejected", function (done) {
            var error = new Error("rejected");
            var error1 = new Error("rejected for another reason");
            var pending = Promise.defer();
            var rejected = Promise.reject(error);
            var waitAll = Promise.waitAll([ rejected, pending.promise ]);
            waitAll.then(preventOnFulfilled, function (reason) {
                assert.isObject(reason.detail, "when Promise.waitAll is rejected, the reason must contain a detail object.");
                assert.equal(reason.detail.failCount, 2);
                assert.isArray(reason.detail.errors);
                assert.equal(reason.detail.errors[0], error);
                assert.equal(reason.detail.errors[1], error1);
                assert.isArray(reason.detail.results);
                assert.isUndefined(reason.detail.results[0]);
                assert.isUndefined(reason.detail.results[1]);
            })
                .then(done, testFailed(done));
            rejected.catch(function () {
                setTimeout(function () {
                    if (waitAll.status !== Promise.PENDING) {
                        pending.reject(new Error("Promise.waitAll must remain pending until all promises are settled"));
                    }
                    else {
                        pending.reject(error1);
                    }
                }, 15);
            })
        });
        it("must be fulfilled when all input values are fulfilled with an array of the promises values", function (done) {
            var p1 = Promise.resolve(1);
            var p2 = new Promise(function (resolve) {
                setTimeout(function () {
                    resolve(2);
                }, 10);
            });
            var p3 = Promise.defer();
            p3.resolve(3);
            var p4 = new Thenable();
            setTimeout(function () {
                p4.resolve(4);
            }, 10);
            var p5 = new ValueThenable(5);
            Promise.waitAll([ 0, p1, p2, p3.promise, p4, p5 ])
                .then(function (value) {
                    assert.isArray(value);
                    assert.deepEqual(value, [0, 1, 2, 3, 4, p5]);
                })
                .then(done, testFailed(done));
        });
        it("must be rejected if accessing input then property throws", function (done) {
            var error = new Error("rejected");
            Promise.waitAll([ new ThrowingThenProperty(error) ])
                .then(preventOnFulfilled, function (reason) {
                    assert.equal(reason.detail.errors[0], error);
                })
                .then(done, testFailed(done));
        });
        it("must be rejected if input then method throws", function (done) {
            var error = new Error("rejected");
            Promise.waitAll([ new ThrowingThenable(error) ])
                .then(preventOnFulfilled, function (reason) {
                    assert.equal(reason.detail.errors[0], error);
                })
                .then(done, testFailed(done));
        });
    });
    describe("7.3 Promise.delay", function () {
        it("should stand as a shortcut for Promise.resolve().delay()", function (done) {
            var dt = Date.now();
            Promise.delay(15)
                .then(function (result) {
                    assert.isUndefined(result);
                    assert.operator(Date.now(), ">=", dt + 15);
                    return Promise.delay(42, 0);
                })
                .then(function (result) {
                    assert.equal(result, 42);
                })
                .then(testDone(done), testFailed(done));
        });
    });
    describe("7.4 Promise.invoke", function () {
        it("requires an object or function as first argument", function (done) {
            Promise.invoke()
                .then(preventOnFulfilled, function (reason) {
                    assert.ok(reason instanceof TypeError, "Promise.invoke requires a function or object as first argument.");
                    return Promise.invoke("foo");
                })
                .then(preventOnFulfilled, function (reason) {
                    assert.ok(reason instanceof TypeError, "Promise.invoke requires a function or object as first argument.");
                })
                .then(testDone(done), testFailed(done));
        });

        it("requires a string or a function as second argument if first argument is an object", function (done) {
            Promise.invoke({})
                .then(preventOnFulfilled, function (reason) {
                    assert.ok(reason instanceof TypeError, "requires a string or a function as second argument if first argument is an object.");
                    return Promise.invoke({}, {});
                })
                .then(preventOnFulfilled, function (reason) {
                    assert.ok(reason instanceof TypeError, "requires a string or a function as second argument if first argument is an object.");
                })
                .then(testDone(done), testFailed(done));
        });

        it("should convert a callback-based function API into a promise-based one", function (done) {
            var promises = [];
            var error = new Error("rejected");

            function echoArgs() {
                var k, last = arguments.length - 1;
                var args = [ null ];
                for (k = 0; k < last; ++k) {
                    args.push(arguments[k]);
                }
                arguments[last].apply(undefined, args);
            }

            function fail(done) {
                done(error);
            }

            promises.push(Promise.invoke(echoArgs).then(function (result) {
                assert.isUndefined(result);
            }));
            promises.push(Promise.invoke(echoArgs, 1).then(function (result) {
                assert.equal(result, 1);
            }));
            promises.push(Promise.invoke(echoArgs, 1, 2).then(function (result) {
                assert.deepEqual(result, [ 1, 2 ]);
            }));
            promises.push(Promise.invoke(echoArgs, 1, 2, 3).then(function (result) {
                assert.deepEqual(result, [ 1, 2, 3]);
            }));
            promises.push(Promise.invoke(echoArgs, 1, 2, 3, 4).then(function (result) {
                assert.deepEqual(result, [ 1, 2, 3, 4 ]);
            }));
            promises.push(Promise.invoke(echoArgs, 1, 2, 3, 4, 5).then(function (result) {
                assert.deepEqual(result, [ 1, 2, 3, 4, 5 ]);
            }));
            promises.push(Promise.invoke(fail).then(preventOnFulfilled, function (reason) {
                assert.equal(reason, error);
            }));

            Promise.all(promises).then(function () {
                done();
            }, testFailed(done));
        });

        it("should convert a callback-based object API into a promise-based one", function (done) {
            var promises = [];
            var error = new Error("rejected");

            var obj = {
                echoArgs: function () {
                    var k, last = arguments.length - 1;
                    var args = [ null, this ];
                    for (k = 0; k < last; ++k) {
                        args.push(arguments[k]);
                    }
                    arguments[last].apply(undefined, args);
                },
                fail: function (done) {
                    done(error);
                }
            };

            // Promise.objectInvoke with method name as 2nd parameter
            promises.push(Promise.invoke(obj, "echoArgs").then(function (result) {
                assert.equal(result, obj);
            }));
            promises.push(Promise.invoke(obj, "echoArgs", 1).then(function (result) {
                assert.deepEqual(result, [ obj, 1 ]);
            }));
            promises.push(Promise.invoke(obj, "echoArgs", 1, 2).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2 ]);
            }));
            promises.push(Promise.invoke(obj, "echoArgs", 1, 2, 3).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2, 3]);
            }));
            promises.push(Promise.invoke(obj, "echoArgs", 1, 2, 3, 4).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2, 3, 4 ]);
            }));
            promises.push(Promise.invoke(obj, "echoArgs", 1, 2, 3, 4, 5).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2, 3, 4, 5 ]);
            }));
            promises.push(Promise.invoke(obj, "fail").then(preventOnFulfilled, function (reason) {
                assert.equal(reason, error);
            }));

            // Promise.invoke with function as 2nd parameter
            promises.push(Promise.invoke(obj, obj.echoArgs).then(function (result) {
                assert.equal(result, obj);
            }));
            promises.push(Promise.invoke(obj, obj.echoArgs, 1).then(function (result) {
                assert.deepEqual(result, [ obj, 1 ]);
            }));
            promises.push(Promise.invoke(obj, obj.echoArgs, 1, 2).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2 ]);
            }));
            promises.push(Promise.invoke(obj, obj.echoArgs, 1, 2, 3).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2, 3]);
            }));
            promises.push(Promise.invoke(obj, obj.echoArgs, 1, 2, 3, 4).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2, 3, 4 ]);
            }));
            promises.push(Promise.invoke(obj, obj.echoArgs, 1, 2, 3, 4, 5).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2, 3, 4, 5 ]);
            }));
            promises.push(Promise.invoke(obj, obj.fail).then(preventOnFulfilled, function (reason) {
                assert.equal(reason, error);
            }));
            promises.push(Promise.objectInvoke(obj, obj.echoArgs, 1).then(function (result) {
                assert.deepEqual(result, [ obj, 1 ]);
            }));

            Promise.all(promises).then(function () {
                done();
            }, testFailed(done));
        });

        it("should return a rejected promise in case of exception", function (done) {
            var error = new Error("I'm a bad function");
            var obj = {
                bad: function () {
                    throw error;
                }
            };

            function badFunction() {
                throw error;
            }

            Promise.invoke(badFunction)
                .then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error);
                    return Promise.invoke(obj, "bad");
                })
                .then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error);
                })
                .then(testDone(done), testFailed(done));
        });

    });
    describe("7.5 Promise.fnCall", function () {
        it("requires an object or function as first argument", function (done) {
            Promise.invoke()
                .then(preventOnFulfilled, function (reason) {
                    assert.ok(reason instanceof TypeError, "Promise.fnCall requires a function or object as first argument.");
                    return Promise.fnCall("foo");
                })
                .then(preventOnFulfilled, function (reason) {
                    assert.ok(reason instanceof TypeError, "Promise.fnCall requires a function or object as first argument.");
                })
                .then(testDone(done), testFailed(done));
        });

        it("requires a string or a function as second argument if first argument is an object", function (done) {
            Promise.invoke({})
                .then(preventOnFulfilled, function (reason) {
                    assert.ok(reason instanceof TypeError, "Promise.fnCall requires a string or a function as second argument if first argument is an object.");
                    return Promise.fnCall({}, {});
                })
                .then(preventOnFulfilled, function (reason) {
                    assert.ok(reason instanceof TypeError, "Promise.fnCall requires a string or a function as second argument if first argument is an object.");
                })
                .then(testDone(done), testFailed(done));
        });

        it("should wraps the result of a function call into a Promise", function (done) {
            var promises = [];
            var error = new Error("rejected");

            function echoArgs() {
                var k, len = arguments.length;
                var args = [];
                for (k = 0; k < len; ++k) {
                    args.push(arguments[k]);
                }
                return args;
            }

            function fail() {
                throw error;
            }

            promises.push(Promise.fnCall(echoArgs).then(function (result) {
                assert.deepEqual(result, []);
            }));
            promises.push(Promise.fnCall(echoArgs, 1).then(function (result) {
                assert.deepEqual(result, [ 1 ]);
            }));
            promises.push(Promise.fnCall(echoArgs, 1, 2).then(function (result) {
                assert.deepEqual(result, [ 1, 2 ]);
            }));
            promises.push(Promise.fnCall(echoArgs, 1, 2, 3).then(function (result) {
                assert.deepEqual(result, [ 1, 2, 3]);
            }));
            promises.push(Promise.fnCall(echoArgs, 1, 2, 3, 4).then(function (result) {
                assert.deepEqual(result, [ 1, 2, 3, 4 ]);
            }));
            promises.push(Promise.fnCall(echoArgs, 1, 2, 3, 4, 5).then(function (result) {
                assert.deepEqual(result, [ 1, 2, 3, 4, 5 ]);
            }));
            promises.push(Promise.fnCall(fail).then(preventOnFulfilled, function (reason) {
                assert.equal(reason, error);
            }));

            Promise.all(promises).then(function () {
                done();
            }, testFailed(done));
        });

        it("should wraps the result of a member function call into a Promise", function (done) {
            var promises = [];
            var error = new Error("rejected");

            var obj = {
                echoArgs: function () {
                    var k, len = arguments.length;
                    var args = [ this ];
                    for (k = 0; k < len; ++k) {
                        args.push(arguments[k]);
                    }
                    return args;
                },
                fail: function () {
                    throw error;
                }
            };

            // Promise.objectInvoke with method name as 2nd parameter
            promises.push(Promise.fnCall(obj, "echoArgs").then(function (result) {
                assert.deepEqual(result, [ obj ]);
            }));
            promises.push(Promise.fnCall(obj, "echoArgs", 1).then(function (result) {
                assert.deepEqual(result, [ obj, 1 ]);
            }));
            promises.push(Promise.fnCall(obj, "echoArgs", 1, 2).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2 ]);
            }));
            promises.push(Promise.fnCall(obj, "echoArgs", 1, 2, 3).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2, 3]);
            }));
            promises.push(Promise.fnCall(obj, "echoArgs", 1, 2, 3, 4).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2, 3, 4 ]);
            }));
            promises.push(Promise.fnCall(obj, "echoArgs", 1, 2, 3, 4, 5).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2, 3, 4, 5 ]);
            }));
            promises.push(Promise.fnCall(obj, "fail").then(preventOnFulfilled, function (reason) {
                assert.equal(reason, error);
            }));

            // Promise.invoke with function as 2nd parameter
            promises.push(Promise.fnCall(obj, obj.echoArgs).then(function (result) {
                assert.deepEqual(result, [ obj ]);
            }));
            promises.push(Promise.fnCall(obj, obj.echoArgs, 1).then(function (result) {
                assert.deepEqual(result, [ obj, 1 ]);
            }));
            promises.push(Promise.fnCall(obj, obj.echoArgs, 1, 2).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2 ]);
            }));
            promises.push(Promise.fnCall(obj, obj.echoArgs, 1, 2, 3).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2, 3]);
            }));
            promises.push(Promise.fnCall(obj, obj.echoArgs, 1, 2, 3, 4).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2, 3, 4 ]);
            }));
            promises.push(Promise.fnCall(obj, obj.echoArgs, 1, 2, 3, 4, 5).then(function (result) {
                assert.deepEqual(result, [ obj, 1, 2, 3, 4, 5 ]);
            }));
            promises.push(Promise.fnCall(obj, obj.fail).then(preventOnFulfilled, function (reason) {
                assert.equal(reason, error);
            }));

            Promise.all(promises).then(function () {
                done();
            }, testFailed(done));
        });
    });
});
