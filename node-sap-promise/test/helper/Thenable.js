function isFunction(x) {
    return (typeof x === "function");
}

// Crude thenable object
function Thenable(onThen) {
    this._fulfillReactions = [];
    this._rejectReactions = [];
    this.status = "pending";
    this.onThen = onThen;
}
Thenable.prototype.then = function (onFulfilled, onRejected) {
    switch (this.status) {
        case "pending":
            if (isFunction(onFulfilled)) {
                this._fulfillReactions.push(onFulfilled);
            }
            if (isFunction(onRejected)) {
                this._rejectReactions.push(onRejected);
            }
            break;
        case "fulfilled":
            if (isFunction(onFulfilled)) {
                onFulfilled(this.result);
            }
            break;
        case "rejected":
            if (isFunction(onRejected)) {
                onRejected(this.result);
            }
            break;
    }
    if (this.onThen) {
        this.onThen();
    }
};
Thenable.prototype.resolve = function (value) {
    this.status = "fulfilled";
    this.result = value;
    this._fulfillReactions.forEach(function(onFulfilled) {
        onFulfilled(value);
    });
};
Thenable.prototype.reject = function (reason) {
    this.status = "rejected";
    this.result = reason;
    this._rejectReactions.forEach(function(onRejected) {
        onRejected(reason);
    });
};
Thenable.resolve = function (resolution) {
    var thenable = new Thenable();
    thenable.resolve(resolution);
    return thenable;
};
Thenable.reject = function (reason) {
    var thenable = new Thenable();
    thenable.reject(reason);
    return thenable;
};

module.exports = Thenable;