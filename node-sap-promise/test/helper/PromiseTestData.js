var Promise;

var Thenable = require("./Thenable.js");
var CustomThenables = require("./CustomThenables.js");
var ValueThenable = CustomThenables.ValueThenable;
var ThrowingThenable = CustomThenables.ThrowingThenable;
var ThrowingThenProperty = CustomThenables.ThrowingThenProperty;

var PromiseTestData = {
    value: "value",
    thenValue: new ValueThenable("thenValue"),
    promiseValue: "promise",
    promiseDummyValue: "promise dummy",
    promiseError: new Error("promise"),
    promiseDummyError: new Error("promise dummy"),
    thenableValue: "thenable",
    thenableDummyValue: "thenable dummy",
    thenableError: new Error("thenable"),
    thenableDummyError: new Error("thenable dummy"),
    fulfilledThenable: Thenable.resolve("thenable")
};

Object.defineProperty(PromiseTestData, "Promise", {
    get: function () {
        return Promise;
    },
    set: function (value) {
        Promise = value;
    }
});

PromiseTestData.createTestPromises =  function () {
    return PromiseFactory.createGroups({
        Values: {
            result: this.value,
            status: "fulfilled"
        },
        ThenValues: {
            result: this.thenValue,
            status: "fulfilled"
        },
        FulfilledPromises: {
            result: this.promiseValue,
            status: "fulfilled"
        },
        RejectedPromises: {
            result: this.promiseError,
            status: "rejected"
        },
        FulfilledThenables: {
            result: this.thenableValue,
            status: "fulfilled"
        },
        RejectedThenables: {
            result: this.thenableError,
            status: "rejected"
        },
        ThrowingThenables: {
            result: this.thenableError,
            status: "rejected"
        },
        MultiplyFulfilledThenables: {
            input: [ this.thenableValue, this.thenableDummyValue ],
            result: this.thenableValue,
            status: "fulfilled"
        },
        MultiplyRejectedThenables: {
            input: [ this.thenableError, this.thenableDummyError ],
            result: this.thenableError,
            status: "rejected"
        },
        ThenableRejectedToThenable: {
            result: this.fulfilledThenable,
            status: "rejected"
        }
    });
};

module.exports = PromiseTestData;

var PromiseTestGroups = {
    Values: {
        Value: "Value"
    },
    ThenValues: {
        ThenValue: "ThenValue"
    },
    FulfilledPromises: {
        Fulfilled: "Fulfilled",
        EventuallyFulfilled: "EventuallyFulfilled",
        ResolvedToFulfilled: "ResolvedToFulfilled",
        ResolvedToEventuallyFulfilled: "ResolvedToEventuallyFulfilled",
        EventuallyResolvedToFulfilled: "EventuallyResolvedToFulfilled",
        EventuallyResolvedToEventuallyFulfilled: "EventuallyResolvedToEventuallyFulfilled"
    },
    RejectedPromises: {
        Rejected: "Rejected",
        EventuallyRejected: "EventuallyRejected",
        ResolvedToRejected: "ResolvedToRejected",
        ResolvedToEventuallyRejected: "ResolvedToEventuallyRejected",
        EventuallyResolvedToRejected: "EventuallyResolvedToRejected",
        EventuallyResolvedToEventuallyRejected: "EventuallyResolvedToEventuallyRejected"
    },
    FulfilledThenables: {
        ThenableFulfilled: "ThenableFulfilled",
        ThenableEventuallyFulfilled: "ThenableEventuallyFulfilled",
        ThenableFulfilledToFulfilledThenable: "ThenableFulfilledToFulfilledThenable",
        ThenableFulfilledToEventuallyFulfilledThenable: "ThenableFulfilledToEventuallyFulfilledThenable",
        ThenableEventuallyFulfilledToFulfilledThenable: "ThenableEventuallyFulfilledToFulfilledThenable",
        ThenableEventuallyFulfilledToEventuallyFulfilledThenable: "ThenableEventuallyFulfilledToEventuallyFulfilledThenable"
    },
    RejectedThenables: {
        ThenableRejected: "ThenableRejected",
        ThenableEventuallyRejected: "ThenableEventuallyRejected",
        ThenableFulfilledToRejectedThenable: "ThenableFulfilledToRejectedThenable",
        ThenableFulfilledToEventuallyRejectedThenable: "ThenableFulfilledToEventuallyRejectedThenable",
        ThenableEventuallyFulfilledToRejectedThenable: "ThenableEventuallyFulfilledToRejectedThenable",
        ThenableEventuallyFulfilledToEventuallyRejectedThenable: "ThenableEventuallyFulfilledToEventuallyRejectedThenable"
    },
    ThrowingThenables: {
        ThrowingThenable: "ThrowingThenable",
        ThrowingThenProperty: "ThrowingThenProperty",
        ThenableEventuallyFulfilledToThrowingThenable: "ThenableEventuallyFulfilledToThrowingThenable",
        ThenableEventuallyFulfilledToThrowingThenProperty: "ThenableEventuallyFulfilledToThrowingThenProperty"
    },
    MultiplyFulfilledThenables: {
        ThenableMultiplyFulfilled: "ThenableMultiplyFulfilled",
        ThenableEventuallyMultiplyFulfilled: "ThenableEventuallyMultiplyFulfilled"
    },
    MultiplyRejectedThenables: {
        ThenableMultiplyRejected: "ThenableMultiplyRejected",
        ThenableEventuallyMultiplyRejected: "ThenableEventuallyMultiplyRejected"
    },
    ThenableRejectedToThenable: {
        ThenableRejectedToFulfilledThenable: "ThenableRejectedToFulfilledThenable"
    }
};

var PromiseFactory = {};
PromiseFactory.create = function (type, result) {
    var retVal;
    if (typeof type === "string") {
        // Create a single "promise"
        retVal = PromiseFactory[type](result);
    }
    else if (Array.isArray(type)){
        // Create multiple "promises" with the same result
        // Create multiple "promises" from an array of type/result pairs (stored as [type, result] array)
        retVal = [];
        type.forEach(function (t) {
            if (Array.isArray(t)) {
                retVal.push(PromiseFactory.create(t[0], t[1]));
            }
            else {
                retVal.push(PromiseFactory.create(t, result));
            }
        });
    }
    else {
        // Create multiple "promises" for a list of type/result pairs stored as object properties
        retVal = {};
        Object.getOwnPropertyNames(type).forEach(function (t) {
            retVal[t] = PromiseFactory.create(t, type[t]);
        });
    }
    return retVal;
};
PromiseFactory.createGroup = function (groupName, input) {
    var promises = {};
    Object.getOwnPropertyNames(PromiseTestGroups[groupName]).forEach(function (testCase) {
        promises[testCase] = PromiseFactory.create(testCase, input);
    });
    return promises;
};
PromiseFactory.createGroups = function (groups) {
    var promises = {};
    Object.getOwnPropertyNames(groups).forEach(function (groupName) {
        var group, input;
        group = groups[groupName];
        input = group.input || group.result;
        promises[groupName] = {
            result: group.result,
            status: group.status,
            promises: PromiseFactory.createGroup(groupName, input)
        }
    });
    return promises;
};
PromiseFactory.createTestPromises = function () {
    return PromiseFactory.createGroups(PromiseTestGroups);
};
PromiseFactory.Pending = function () {
    return new Promise(function () {});
};
PromiseFactory.Value = function (result) {
    return result;
};
PromiseFactory.ThenValue = function (result) {
    return result;
};
PromiseFactory.Fulfilled = function (result) {
    return Promise.resolve(result);
};
PromiseFactory.EventuallyFulfilled = function (result, delay) {
    delay = delay || 15;
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(result);
        }, delay);
    })
};
PromiseFactory.EventuallyResolved = PromiseFactory.EventuallyFulfilled; // alias for EventuallyResolved helper
PromiseFactory.Rejected = function (result) {
    return Promise.reject(result);
};
PromiseFactory.EventuallyRejected = function (result, delay) {
    delay = delay || 15;
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            reject(result);
        }, delay);
    })
};
PromiseFactory.ResolvedToPending = function () {
    return Promise.resolve(PromiseFactory.Pending());
};
PromiseFactory.ResolvedToFulfilled = function (result) {
    return Promise.resolve(PromiseFactory.Fulfilled(result));
};
PromiseFactory.ResolvedToEventuallyFulfilled = function (result) {
    return Promise.resolve(PromiseFactory.EventuallyFulfilled(result));
};
PromiseFactory.EventuallyResolvedToFulfilled = function (result) {
    return PromiseFactory.EventuallyResolved(PromiseFactory.Fulfilled(result));
};
PromiseFactory.EventuallyResolvedToEventuallyFulfilled = function (result, delay) {
    delay = delay || 15;
    return PromiseFactory.EventuallyResolved(PromiseFactory.EventuallyFulfilled(result, delay + 15), delay);
};
PromiseFactory.ResolvedToRejected = function (result) {
    return Promise.resolve(PromiseFactory.Rejected(result));
};
PromiseFactory.ResolvedToEventuallyRejected = function (result) {
    return Promise.resolve(PromiseFactory.EventuallyRejected(result));
};
PromiseFactory.EventuallyResolvedToRejected = function (result) {
    return PromiseFactory.EventuallyResolved(PromiseFactory.Rejected(result));
};
PromiseFactory.EventuallyResolvedToEventuallyRejected = function (result, delay) {
    delay = delay || 15;
    return PromiseFactory.EventuallyResolved(PromiseFactory.EventuallyRejected(result, delay + 15), delay);
};
PromiseFactory.ThrowingThenable = function (result) {
    return new ThrowingThenable(result);
};
PromiseFactory.ThrowingThenProperty = function (result) {
    return new ThrowingThenProperty(result);
};
PromiseFactory.ThenableFulfilled = function (result) {
    return Thenable.resolve(result);
};
PromiseFactory.ThenableEventuallyFulfilled = function (result, delay) {
    var thenable = new Thenable();
    delay = delay || 15;
    setTimeout(function () {
        thenable.resolve(result);
    }, delay);
    return thenable;
};
PromiseFactory.ThenableMultiplyFulfilled = function (result) {
    var thenable = new Thenable();
    thenable.onThen = function () {
        thenable.onThen = null;
        setTimeout(function () {
            thenable.resolve(result[1]);
        }, 15);
    };
    thenable.resolve(result[0]);
    return thenable;
};
PromiseFactory.ThenableEventuallyMultiplyFulfilled = function (result, delay) {
    delay = delay || 15;
    var thenable = new Thenable();
    thenable.onThen = function () {
        thenable.onThen = null;
        setTimeout(function () {
            thenable.resolve(result[1]);
        }, 15);
    };
    setTimeout(function () {
        thenable.resolve(result[0]);
    }, delay);
    return thenable;
};
PromiseFactory.ThenableRejected = function (result) {
    return Thenable.reject(result);
};
PromiseFactory.ThenableEventuallyRejected = function (result, delay) {
    var thenable = new Thenable();
    delay = delay || 15;
    setTimeout(function () {
        thenable.reject(result);
    }, delay);
    return thenable;
};
PromiseFactory.ThenableMultiplyRejected = function (result) {
    var thenable = new Thenable();
    thenable.onThen = function () {
        thenable.onThen = null;
        setTimeout(function () {
            thenable.reject(result[1]);
        }, 15);
    };
    thenable.reject(result[0]);
    return thenable;
};
PromiseFactory.ThenableEventuallyMultiplyRejected = function (result, delay) {
    delay = delay || 15;
    var thenable = new Thenable();
    thenable.onThen = function () {
        thenable.onThen = null;
        setTimeout(function () {
            thenable.reject(result[1]);
        }, 15);
    };
    setTimeout(function () {
        thenable.reject(result[0]);
    }, delay);
    return thenable;
};
PromiseFactory.ThenableFulfilledToThrowingThenable = function () {
    return Thenable.resolve(new ThrowingThenable());
};
PromiseFactory.ThenableFulfilledToThrowingThenProperty = function () {
    return Thenable.resolve(new ThrowingThenProperty());
};
PromiseFactory.ThenableFulfilledToFulfilledThenable = function (result) {
    return Thenable.resolve(Thenable.resolve(result));
};
PromiseFactory.ThenableFulfilledToEventuallyFulfilledThenable = function (result) {
    return Thenable.resolve(PromiseFactory.ThenableEventuallyFulfilled(result));
};
PromiseFactory.ThenableFulfilledToRejectedThenable = function (result) {
    return Thenable.resolve(Thenable.reject(result));
};
PromiseFactory.ThenableFulfilledToEventuallyRejectedThenable = function (result) {
    return Thenable.resolve(PromiseFactory.ThenableEventuallyRejected(result));
};
PromiseFactory.ThenableEventuallyFulfilledToThrowingThenable = function (result, delay) {
    var thenable = new Thenable();
    delay = delay || 15;
    setTimeout(function () {
        thenable.resolve(new ThrowingThenable(result));
    }, delay);
    return thenable;
};
PromiseFactory.ThenableEventuallyFulfilledToThrowingThenProperty = function (result, delay) {
    var thenable = new Thenable();
    delay = delay || 15;
    setTimeout(function () {
        thenable.resolve(new ThrowingThenProperty(result));
    }, delay);
    return thenable;
};
PromiseFactory.ThenableEventuallyFulfilledToFulfilledThenable = function (result, delay) {
    var thenable = new Thenable();
    delay = delay || 15;
    setTimeout(function () {
        thenable.resolve(PromiseFactory.ThenableFulfilled(result));
    }, delay);
    return thenable;
};
PromiseFactory.ThenableEventuallyFulfilledToEventuallyFulfilledThenable = function (result, delay) {
    var thenable = new Thenable();
    delay = delay || 15;
    setTimeout(function () {
        thenable.resolve(PromiseFactory.ThenableEventuallyFulfilled(result, delay + 15));
    }, delay);
    return thenable;
};
PromiseFactory.ThenableEventuallyFulfilledToRejectedThenable = function (result, delay) {
    var thenable = new Thenable();
    delay = delay || 15;
    setTimeout(function () {
        thenable.resolve(PromiseFactory.ThenableRejected(result));
    }, delay);
    return thenable;
};
PromiseFactory.ThenableEventuallyFulfilledToEventuallyRejectedThenable = function (result, delay) {
    var thenable = new Thenable();
    delay = delay || 15;
    setTimeout(function () {
        thenable.resolve(PromiseFactory.ThenableEventuallyRejected(result, delay + 15));
    }, delay);
    return thenable;
};
PromiseFactory.ThenableRejectedToFulfilledThenable = function (result) {
    return Thenable.reject(result);
};
