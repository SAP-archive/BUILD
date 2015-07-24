"use strict";
var utils = require("./utils.js");

var isThenable = utils.isThenable;
var invoke = utils.invoke;
var fnCall = utils.fnCall;
var delayCall = utils.delayCall;
var deprecateWarning = {};

function promiseResolve(promise, resolve, reject, resolution) {
    if (promise === resolution) {
        reject(new TypeError("A promise cannot resolve to itself."));
    }
    try {
        if (isThenable(resolution)) {
            resolution.then(function (value) {
                promiseResolve(promise, resolve, reject, value);
            }, function (reason) {
                reject(reason);
            });
        }
        else {
            // value
            resolve(resolution);
        }
    }
    catch (err) {
        reject(err);
    }
}

module.exports = function (Promise) {
    if (Promise._SAP_Enhanced) {
        return;
    }
    Promise._SAP_Enhanced = true;

// ----------------------------------------
//      Promise.prototype enhancement
// ----------------------------------------
    function promiseInvoke(argObject) {
        return new Promise(function (resolve, reject) {
            invoke(argObject, function (err, result) {
                var k, n = arguments.length;
                if (err) {
                    reject(err);
                    return;
                }
                if (n > 2) {
                    result = [ result ];
                    for (k = 2; k < n; ++k) {
                        result.push(arguments[k]);
                    }
                }
                resolve(result);
            });
        });
    }

    /**
     * Returns a promise which will be settled based on the outcome of the onSettled callback. onSettled will be called when the initial promise is settled (i.e. either fulfilled or rejected).
     * @param onSettled Function called when the promise is settled. If the promise is rejected, onSettled is called with the rejection reason as single argument.
     * If the promise is fulfilled, onSettled is called with null as first arguments and the promise fulfillment value as second argument.
     * @returns {Promise}
     */
    Promise.prototype.always = function (onSettled) {
        return this.then(function (result) {
            return (typeof onSettled === "function" ? onSettled(null, result) : result);
        }, function (reason) {
            return (typeof onSettled === "function" ? onSettled(reason) : reason);
        });
    };

    /**
     * Performs a callback-based API call upon promise completion
     * @param {object} [thisArg] Optional this parameter
     * @param {function|string} fn Function or method name to call
     * @param {...*} [arg] Optional parameters to be passed AFTER promise result which is always the first parameter (final callback parameter must NOT be passed)
     * @returns {Promise}
     */
    Promise.prototype.thenInvoke = function (thisArg) {
        var k, arg = arguments, len = arg.length, argStart = (typeof thisArg === "function" ? 1 : 2);
        for (k = len; k > argStart; --k) {
            arg[k] = arg[k - 1];
        }
        arg[argStart] = undefined;
        ++arg.length;
        return this.then(function (result) {
            arg[argStart] = result;
            return promiseInvoke(arg);
        });
    };

    /**
     * Performs a regular function call upon promise completion
     * @param {object} [thisArg] Optional this parameter
     * @param {function|string} fn Function or method name to call
     * @param {...*} [arg] Optional parameters to be passed AFTER promise result which is always the first parameter
     * @returns {Promise}
     */
    Promise.prototype.thenCall = function (thisArg) {
        var k, arg = arguments, len = arg.length, argStart = (typeof thisArg === "function" ? 1 : 2);
        for (k = len; k > argStart; --k) {
            arg[k] = arg[k - 1];
        }
        arg[argStart] = undefined;
        ++arg.length;
        return this.then(function (result) {
            arg[argStart] = result;
            return fnCall(arg);
        });
    };

    /**
     * @deprecated
     */
    Promise.prototype.setTimeout = function () {
        if (!deprecateWarning["Promise.prototype.setTimeout"]) {
            console.warn("Promise.prototype.setTimeout function is deprecated, use Promise.prototype.timeout instead");
            deprecateWarning["Promise.prototype.setTimeout"] = true;
        }
        return this.timeout.apply(this, Array.prototype.slice.call(arguments));
    };

    /**
     * @deprecated
     */
    Promise.prototype.clearTimeout = function () {
        if (!deprecateWarning["Promise.prototype.clearTimeout"]) {
            console.warn("Promise.prototype.clearTimeout function is deprecated");
            deprecateWarning["Promise.prototype.clearTimeout"] = true;
        }
        return this;
    };

    /**
     * Returns a promise which will be resolved to an alternative resolution if the initial promise has not been settled at timeout expiration.
     * If the initial promise is settled before timeout, the setTimeout promise will be settled accordingly.
     * @param delay timeout in ms
     * @param {any} [resolution] This controls how the promise will be settled after timeout. If resolution is an instance of Error, the promise will be rejected with resolution.
     * If resolution is a function, the promise will be resolved with the return value of the function call. If the function throws an exception, the promise will be rejected accordingly.
     * Otherwise, the promise will be resolved with resolution (applying the standard PromiseResolve logic).
     * If no resolution argument is passed, the promise will be rejected with a default Error.
     * @returns {Promise}
     */
    Promise.prototype.timeout = function (delay, resolution) {
        var onTimeout, timeoutId, defer = Promise.defer();
        delay = ~~delay; // Typecast to integer value
        if (arguments.length === 1) {
            resolution = new Error("Promise timeout expired.");
        }
        if (typeof resolution === "function") {
            onTimeout = function () {
                try {
                    promiseResolve(defer.promise, defer.resolve, defer.reject, resolution());
                }
                catch (err) {
                    defer.reject(err);
                }
            };
        }
        else if (resolution instanceof Error) {
            onTimeout = function () {
                defer.reject(resolution);
            };
        }
        else {
            onTimeout = function () {
                try {
                    promiseResolve(defer.promise, defer.resolve, defer.reject, resolution);
                }
                catch (err) {
                    defer.reject(err);
                }
            };
        }
        timeoutId = setTimeout(onTimeout, delay);
        this.then(function (result) {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = undefined;
                defer.resolve(result);
            }
        }, function (reason) {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = undefined;
                defer.reject(reason);
            }
        });
        return defer.promise;
    };

    /*eslint-disable no-empty */

    /**
     * Returns a promise which will be settled according to the initial promise when the return value of the finalizer is settled.
     * @param {function} finalizer Callback function which will be called when the initial promise is settled.
     * If finalizer returns a promise, the finally promise will be settled once the finalizer promise is settled (but with the outcome of the initial promise).
     * @returns {Promise}
     */
    Promise.prototype.finally = function (finalizer) {
        var promise;
        if ((typeof finalizer === "function")) {
            promise = this.then(function (value) {
                var finState, restore;
                try {
                    finState = finalizer();
                }
                catch (e) {
                }
                if (finState) {
                    restore = function () {
                        return value;
                    };
                    return Promise.resolve(finState).then(restore, restore);
                }
                return value;
            }, function (reason) {
                var finState, restore;
                try {
                    finState = finalizer();
                }
                catch (e) {
                }
                if (finState) {
                    restore = function () {
                        throw reason;
                    };
                    return Promise.resolve(finState).then(restore, restore);
                }
                throw reason;
            });
        }
        else {
            promise = this;
        }
        return promise;
    };
    /*eslint-enable no-empty */

    /**
     * Returns a promise that will be settled with the initial promise outcome, after invoking an optional callback.
     * @param {function} [done] Optional callback
     * @returns {Promise}
     */
    Promise.prototype.callback = function (done) {
        if (typeof done === "function") {
            return this.then(function (result) {
                done(null, result);
                return result;
            }, function (err) {
                done(err);
                throw err;
            });
        }
        else {
            return this;
        }
    };

    /**
     * Return
     * @param delay
     * @returns {Promise}
     */
    Promise.prototype.delay = function (delay) {
        delay = delay || 0;
        return this.then(function (result) {
            return new Promise(function (resolve) {
                delayCall(resolve, result, delay);
            });
        }, function (err) {
            return new Promise(function (resolve, reject) {
                delayCall(reject, err, delay);
            });
        });
    };

// ----------------------------------------
//      Promise enhancement
// ----------------------------------------

    /**
     * @deprecated
     */
    Promise.cast = function (value) {
        if (!deprecateWarning["Promise.cast"]) {
            console.warn("Promise.cast function is deprecated, use Promise.resolve instead");
            deprecateWarning["Promise.cast"] = true;
        }
        return Promise.resolve(value);
    };


    /**
     *
     * @param promises
     * @returns {Promise}
     */
    Promise.waitAll = function (promises) {
        var executor;
        if (!Array.isArray(promises)) {
            throw new TypeError("Promise.waitAll requires an array argument.");
        }
        executor = function (resolve, reject) {
            var i, n, results, errors, remaining, getResolver, resolveAt, getRejecter, promise, failCount, success;
            results = [];
            failCount = 0;
            success = 0;
            errors = [];
            remaining = promises.length;
            if (remaining === 0) {
                resolve([]);
                return;
            }
            resolveAt = function (index, value, error) {
                var err;
                if (error) {
                    ++failCount;
                }
                else {
                    ++success;
                }
                results[index] = value;
                errors[index] = error;
                --remaining;
                if (remaining === 0) {
                    if (failCount) {
                        if (success) {
                            err = new Error("Some operations failed");
                        }
                        else {
                            err = new Error("All operations failed");
                        }
                        err.detail = {
                            errors: errors,
                            failCount: failCount,
                            results: results
                        };
                        reject(err);
                    }
                    else {
                        resolve(results);
                    }
                }
            };
            getResolver = function (index) {
                return function (value) {
                    resolveAt(index, value);
                };
            };
            getRejecter = function (index) {
                return function (reason) {
                    reason = reason || new Error("Operation failed");
                    resolveAt(index, undefined, reason);
                };
            };
            n = remaining;
            for (i = 0; i < n; ++i) {
                promise = promises[i];
                try {
                    if (isThenable(promise)) {
                        Promise.resolve(promise).then(getResolver(i), getRejecter(i));
                    }
                    else {
                        resolveAt(i, promise);
                    }
                }
                catch (e) {
                    // isThenable may throw as it accesses promise.then property
                    getRejecter(i)(e);
                }
            }
        };
        return new Promise(executor);
    };

// Expose a defer API for people used to Q
    /**
     *
     * @returns {{}}
     */
    Promise.defer = function () {
        var deferred = {};
        deferred.promise = new Promise(function (resolve, reject) {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });
        return deferred;
    };
    /**
     * Transforms a callback-based API call into a Promise-based one
     * @param {object} [thisArg] Optional this parameter
     * @param {function|string} fn Function or method name to call
     * @param {...*} [arg] Optional function parameters: final callback parameter must NOT be passed
     * @returns {Promise}
     */
    Promise.invoke = function () {
        return promiseInvoke(arguments);
    };

    /**
     * Wraps the result of a synchronous function into a Promise.
     * @param {object} [thisArg] Optional this parameter
     * @param {function|string} fn Function or method name to call
     * @param {...*} [arg] Optional function parameters
     * @returns {Promise} Promise resolved to the function return value or rejected with the error thrown by the function
     */
    Promise.fnCall = function () {
        var args = arguments;
        return new Promise(function (resolve) {
            resolve(fnCall(args));
        });
    };

    /**
     * @deprecated
     */
    Promise.objectInvoke = function () {
        if (!deprecateWarning["Promise.objectInvoke"]) {
            console.warn("Promise.objectInvoke function is deprecated, use Promise.invoke instead");
            deprecateWarning["Promise.objectInvoke"] = true;
        }
        return Promise.invoke.apply(undefined, Array.prototype.slice.call(arguments));
    };

    /**
     * Returns a Promise which will be resolved with resolution after delay milliseconds
     * @param {*} [resolution] Resolved value, default to undefined
     * @param {number} delay Delay in milliseconds before promise is fulfilled
     * @returns {Promise}
     */
    Promise.delay = function (resolution, delay) {
        if (arguments.length <= 1) {
            delay = resolution;
            resolution = undefined;
        }
        return Promise.resolve(resolution).delay(delay);
    };
};
