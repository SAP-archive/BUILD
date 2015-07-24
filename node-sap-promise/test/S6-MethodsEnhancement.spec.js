var chai = require("chai");
var assert = chai.assert;
var expect = chai.expect
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

function delayFulfill(result, delay) {
    delay = delay || 20;
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(result);
        }, delay);
    });
}
function delayReject(err, delay) {
    delay = delay || 20;
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            reject(err);
        }, delay);
    });
}

// ------------------------------------------------------------
//      6 Promise prototype methods
// ------------------------------------------------------------

describe("6 Promise prototype methods", function () {
    describe("6.1 finally", function () {
        it("should return a Promise", function () {
            assert.ok(Promise.resolve(1).finally() instanceof Promise);
        });
        it("should return the promise itself if it is called with a non function argument", function () {
            var promise = Promise.resolve(1);
            assert.equal(promise.finally(), promise);
            assert.equal(promise.finally(1), promise);
            assert.equal(promise.finally({}), promise);
        });
        it("should call finalizer after promise is fulfilled and before fulfilling finally promise", function (done) {
            var finalized = false;
            Promise.resolve(1)
                .finally(function () {
                    finalized = true;
                })
                .then(function () {
                    assert.ok(finalized);
                })
                .then(done, testFailed(done));
        });
        it("should call finalizer after promise is rejected and before rejecting finally promise", function (done) {
            var finalized = false;
            Promise.reject(new Error("rejected"))
                .finally(function () {
                    finalized = true;
                })
                .then(preventOnFulfilled, function () {
                    assert.ok(finalized);
                })
                .then(done, testFailed(done));
        });
        it("finally promise must be fulfilled with the same value", function (done) {
            Promise.resolve(1)
                .finally(function () {
                    return 2;
                }).then(function (value) {
                    assert.equal(value, 1);
                }).then(done, testFailed(done));
        });
        it("finally promise must be rejected with the same reason", function (done) {
            var error = new Error("rejected");
            Promise.reject(error)
                .finally(function () {
                    return 2;
                }).then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error);
                }).then(done, testFailed(done));
        });
        it("should ignore error in finalizer", function (done) {
            var error = new Error("rejected");
            var p1 = Promise.resolve(1)
                .finally(function () {
                    throw new Error("finalizer error");
                }).then(function (value) {
                    assert.equal(value, 1);
                });
            var p2 = Promise.reject(error)
                .finally(function () {
                    throw new Error("finalizer error");
                }).then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error);
                });
            Promise.all([p1, p2]).then(testDone(done), testFailed(done));
        });
        it("should not be settled before the thenable object returned by the finalizer", function (done) {
            var finallyResolved = false;
            var wrapper = Promise.defer();
            Promise.resolve(1)
                .finally(function () {
                    return wrapper;
                }).then(function (value) {
                    finallyResolved = true;
                }).then(done, testFailed(done));

            setTimeout(function () {
                try {
                    assert.ok(!finallyResolved);
                }
                catch (error) {
                    wrapper.reject(error);
                }
            }, 10);
            setTimeout(function () {
                wrapper.resolve(2);
            }, 20);
        });
    });
    describe("6.2 callback", function () {
        describe("6.2.1 callback method returns a promise", function () {
            it("returns a Promise", function () {
                assert.ok(Promise.resolve(1).callback() instanceof Promise);
            });
        });
        describe("6.2.1 if callback parameter is not a function callback returns the promise itself", function () {
            it("must return the promise itself if it is called with a non function argument", function () {
                var promise = Promise.resolve(1);
                assert.equal(promise.callback(), promise);
                assert.equal(promise.callback(1), promise);
                assert.equal(promise.callback({}), promise);
            });
        });
        describe("6.2.2 if callback parameter is a function, it must be called after promise is fulfilled or rejected and before fulfilling, rejecting callback_promise", function () {
            it("callback must be called after promise is fulfilled and before fulfilling finally promise", function (done) {
                var doneCalled = false;
                Promise.resolve(1)
                    .callback(function () {
                        doneCalled = true;
                    })
                    .then(function () {
                        assert.ok(doneCalled);
                    })
                    .then(done, testFailed(done));
            });
            it("callback must be called after promise is rejected and before rejecting finally promise", function (done) {
                var doneCalled = false;
                Promise.reject(new Error("rejected"))
                    .callback(function () {
                        doneCalled = true;
                    })
                    .then(preventOnFulfilled, function () {
                        assert.ok(doneCalled);
                    })
                    .then(done, testFailed(done));
            });
        });
        describe("6.2.3 if/when promise is fulfilled, callback function must be called with null as first argument and promise value as second argument.", function () {
            it("calback function must be called with parameters (null, value)", function (done) {
                Promise.resolve(1)
                    .callback(function (err, result) {
                        assert.ok(!err);
                        assert.equal(result, 1);
                    }).then(function () {
                        done()
                    }, testFailed(done));
            });
        });
        describe("6.2.4 if/when promise is fulfilled, callback promise must be fulfilled with the same value", function () {
            it("calback promise must be fulfilled with the same value", function (done) {
                Promise.resolve(1)
                    .callback(function () {
                    }).then(function (value) {
                        assert.equal(value, 1);
                    }).then(done, testFailed(done));
            });
        });
        describe("6.2.5 if/when promise is rejected, callback function must be called with reason as first argument", function () {
            it("calback function must be called with parameter (error)", function (done) {
                var error = new Error("rejected");
                Promise.reject(error)
                    .callback(function (reason) {
                        assert.equal(reason, error);
                    }).then(preventOnFulfilled, function (reason) {
                    }).then(done, testFailed(done));
            });
        });
        describe("6.2.6 if/when promise is rejected, callback promise must be rejected with the same reason", function () {
            it("calback promise must be rejected with the same reason", function (done) {
                var error = new Error("rejected");
                Promise.reject(error)
                    .callback(function () {
                    }).then(preventOnFulfilled, function (reason) {
                        assert.equal(reason, error);
                    }).then(done, testFailed(done));
            });
        });
    });
    describe("6.3 timeout", function () {
        it("should return a promise", function () {
            var p = Promise.resolve(1);
            assert.ok(p.timeout(0) instanceof Promise);
        });
        it("should be settled after timeout expiration", function (done) {
            var promises = [];
            var err = new Error("rejected");
            promises.push(Promise.resolve(1).timeout(20).then(function (result) {
                assert.equal(result, 1);
            }));
            promises.push(Promise.reject(err).timeout(20).then(preventOnFulfilled, function (reason) {
                assert.equal(reason, err);
            }));
            promises.push(delayFulfill(1, 30).timeout(15).then(preventOnFulfilled, function () {
            }));
            promises.push(delayFulfill(1, 30).timeout(15, err).then(preventOnFulfilled, function (reason) {
                assert.equal(reason, err);
            }));
            promises.push(delayFulfill(1, 30).timeout(15, 2).then(function (result) {
                assert.equal(result, 2);
            }));
            promises.push(delayFulfill(1, 30).timeout(15, function () {
                return 2;
            }).then(function (result) {
                assert.equal(result, 2);
            }));
            promises.push(delayFulfill(1, 30).timeout(15, function () {
                throw err;
            }).then(preventOnFulfilled, function (reason) {
                assert.equal(reason, err);
            }));
            promises.push(Promise.resolve(1).setTimeout(10).clearTimeout());
            Promise.all(promises).then(testDone(done), testFailed(done));
        });
        it("should fail when trying to resolve to itself", function (done) {
            var tp;
            function badResolve() {
                return tp;
            }
            tp = Promise.defer().promise.timeout(10, badResolve);
            tp.then(preventOnFulfilled, function (err) {
                expect(err).to.be.instanceof(TypeError);
            })
                .then(testDone(done), testFailed(done));
        });
    });
    describe("6.4 always", function () {
        describe("6.4.1 always method returns a promise", function () {
            it("should return a promise", function () {
                assert.ok(Promise.resolve(1).always() instanceof Promise);
            });
        });
        describe("6.4.4 always method is called when the promise is settled", function () {
            it("should always be called", function (done) {
                var err = new Error("rejected");
                Promise.resolve(1)
                    .always(function (reason, result) {
                        assert.ok(!reason);
                        assert.equal(result, 1);
                        throw err;
                    })
                    .always(function (reason) {
                        assert.equal(reason, err);
                    })
                    .then(testDone(done), testFailed(done));
            });
        });
    });
    describe("6.5 delay", function () {
        it("should return a Promise", function () {
            assert.ok(Promise.resolve(1).delay() instanceof Promise);
        });
        it("should delay the result of a fulfilled promise", function (done) {
            // setTimeout is not very accurate
            var dt = Date.now();
            Promise.resolve(1).delay(20)
                .then(function (result) {
                    var duration = Date.now() - dt;
                    assert.ok(duration >= 15);
                    assert.equal(result, 1);
                })
                .then(testDone(done), testFailed(done));
        });
        it("should delay the result of a rejected promise", function (done) {
            var err = new Error("rejected");
            var dt = Date.now();
            Promise.reject(err).delay(20)
                .then(preventOnFulfilled, function (reason) {
                    var duration = Date.now() - dt;
                    assert.ok(duration >= 15);
                    assert.equal(reason, err);
                })
                .then(testDone(done), testFailed(done));
        });
    });
    describe("6.6 thenInvoke", function () {
        function echoArgs() {
            var k, last = arguments.length - 1;
            var args = [ null ];
            for (k = 0; k < last; ++k) {
                args.push(arguments[k]);
            }
            arguments[last].apply(undefined, args);
        }
        var echoObj = {
            echoArgs: function () {
                var k, last = arguments.length - 1;
                var args = [ null, this ];
                for (k = 0; k < last; ++k) {
                    args.push(arguments[k]);
                }
                arguments[last].apply(undefined, args);
            }
        };

        it("should return a Promise", function () {
            assert.ok(Promise.resolve(1).thenInvoke() instanceof Promise);
        });

        it("should allow invoking a function with the promise result as first parameter", function (done) {
            Promise.resolve(1)
                .thenInvoke(echoArgs)
                .then(function (result) {
                    expect(result).to.equal(1);
                    return 2;
                })
                .thenInvoke(echoArgs, 3)
                .then(function (result) {
                    expect(result).to.deep.equal([ 2, 3 ]);
                })
                .then(testDone(done), testFailed(done));
        });

        it("should allow invoking a member function with the promise result as first parameter", function (done) {
            Promise.resolve(1)
                .thenInvoke(echoObj, 'echoArgs')
                .then(function (result) {
                    expect(result).to.deep.equal([ echoObj, 1 ]);
                    return 2;
                })
                .thenInvoke(echoObj, 'echoArgs', 3)
                .then(function (result) {
                    expect(result).to.deep.equal([ echoObj, 2, 3 ]);
                })
                .then(testDone(done), testFailed(done));
        });
    });

    describe("6.7 thenCall", function () {
        function echoArgs() {
            var k, len = arguments.length;
            var args = [ ];
            for (k = 0; k < len; ++k) {
                args.push(arguments[k]);
            }
            return Promise.resolve(args);
        }
        var echoObj = {
            echoArgs: function () {
                var k, len = arguments.length;
                var args = [ this ];
                for (k = 0; k < len; ++k) {
                    args.push(arguments[k]);
                }
                return Promise.resolve(args);
            }
        };

        it("should return a Promise", function () {
            assert.ok(Promise.resolve(1).thenCall() instanceof Promise);
        });

        it("should allow invoking a function with the promise result as first parameter", function (done) {
            Promise.resolve(1)
                .thenCall(echoArgs)
                .then(function (result) {
                    expect(result).to.deep.equal([1]);
                    return 2;
                })
                .thenCall(echoArgs, 3)
                .then(function (result) {
                    expect(result).to.deep.equal([ 2, 3 ]);
                })
                .then(testDone(done), testFailed(done));
        });

        it("should allow invoking a member function with the promise result as first parameter", function (done) {
            Promise.resolve(1)
                .thenCall(echoObj, 'echoArgs')
                .then(function (result) {
                    expect(result).to.deep.equal([ echoObj, 1 ]);
                    return 2;
                })
                .thenCall(echoObj, 'echoArgs', 3)
                .then(function (result) {
                    expect(result).to.deep.equal([ echoObj, 2, 3 ]);
                })
                .then(testDone(done), testFailed(done));
        });
    });
});
