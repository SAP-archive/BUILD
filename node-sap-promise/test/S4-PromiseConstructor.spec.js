var assert = require("chai").assert;
var Promise = require("./promise");

var Thenable = require("./helper/Thenable.js");
var CustomThenables = require("./helper/CustomThenables.js");
var ValueThenable = CustomThenables.ValueThenable;
var ThrowingThenable = CustomThenables.ThrowingThenable;
var ThrowingThenProperty = CustomThenables.ThrowingThenProperty;

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
 //      4 Promise constructor
 // ------------------------------------------------------------
 describe("4 Promise constructor", function () {

     describe("4.1 Constructor function", function () {
         it("cannot be invoked without any argument", function () {
             try {
                 var promise = new Promise();
                 assert.ok(false, "new Promise() must throw a TypeError");
             }
             catch(error) {
                 assert.ok(error instanceof TypeError, "new Promise() must throw a TypeError");
             }
         });
         it("requires a function argument", function () {
             try {
                 var promise = new Promise({});
                 assert.ok(false, "new Promise({}) must throw a TypeError");
             }
             catch(error) {
                 assert.ok(error instanceof TypeError, "new Promise({}) must throw a TypeError");
             }
         });
         it("must be applied to an instance of Promise", function () {
             try {
                 Promise.call({}, function () {});
                 assert(false, "invoking Promise constructor with an invalid this must throw");
             }
             catch (error) {
                 assert.ok(error instanceof TypeError, "Promise constructor invoked with invalid this.")
             }
         });
     });

     describe("4.2 Promise.all", function () {
         it("requires an array argument", function () {
             try {
                 Promise.all();
                 assert.ok(false, "Promise.all requires an array argument.");
             }
             catch(error) {
                 assert.ok(error instanceof TypeError, "Promise.all requires an array argument.");
             }
         });
         it("returns a Promise", function () {
             assert(Promise.all([]) instanceof Promise);
         });
         it("must be rejected as soon as one promise is rejected", function (done) {
             var error = new Error("rejected");
             var pending = new Promise(function () {});
             var rejected = Promise.reject(error);
             Promise.all([ pending, rejected ])
                 .then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error);
                 })
                 .then(done, testFailed(done));
         });
         it("must be fulfilled when all input values are fulfilled with an array of the promises values", function (done) {
             var p1 = Promise.resolve(1);
             var p2 = new Promise(function (resolve) {
                 setTimeout(function () {
                     resolve(2);
                 }, 10);
             });
             var p3 = new PromiseWrapper();
             p3.resolve(3);
             var p4 = new Thenable();
             setTimeout(function() {
                 p4.resolve(4);
             }, 10);
             var p5 = new ValueThenable(5);
             Promise.all([ 0, p1, p2, p3.promise, p4, p5 ])
                 .then(function (value) {
                     assert.isArray(value);
                     assert.deepEqual(value, [0, 1, 2, 3, 4, p5]);
                 })
                 .then(done, testFailed(done));
         });
         it("must be rejected if accessing input then property throws", function (done) {
             var error = new Error("rejected");
             Promise.all([ new ThrowingThenProperty(error) ])
                 .then(preventOnFulfilled, function (reason) {
                    assert.equal(reason, error);
                 })
                 .then(done, testFailed(done));
         });
         it("must be rejected if input then method throws", function (done) {
             var error = new Error("rejected");
             Promise.all([ new ThrowingThenable(error) ])
                 .then(preventOnFulfilled, function (reason) {
                     assert.equal(reason, error);
                 })
                 .then(done, testFailed(done));
         });
     });

     describe("4.3 Promise.race", function () {
         it("requires an array argument", function () {
             try {
                 Promise.race();
                 assert.ok(false, "Promise.race requires an array argument.");
             }
             catch(error) {
                 assert.ok(error instanceof TypeError, "Promise.race requires an array argument.");
             }
         });
         it("returns a Promise", function () {
             assert(Promise.race([]) instanceof Promise);
         });
         it("must be rejected as soon as one promise is rejected", function (done) {
             var error = new Error("rejected");
             var pending = new Promise(function () {});
             var rejected = Promise.reject(error);
             Promise.race([ pending, rejected ])
                 .then(preventOnFulfilled, function (reason) {
                     assert.equal(reason, error);
                 })
                 .then(done, testFailed(done));
         });
         it("must be fulfilled as soon as one input value is fulfilled with the corresponding value", function (done) {
             var pending = new Promise(function () {});
             Promise.race([ 0, pending ])
                 .then(function (value) {
                     assert.equal(value, 0);
                 })
                 .then(done, testFailed(done));
         });
         it("must be rejected if accessing input then property throws", function (done) {
             var error = new Error("rejected");
             Promise.race([ new ThrowingThenProperty(error) ])
                 .then(preventOnFulfilled, function (reason) {
                     assert.equal(reason, error);
                 })
                 .then(done, testFailed(done));
         });
         it("must be rejected if input then method throws", function (done) {
             var error = new Error("rejected");
             Promise.race([ new ThrowingThenable(error) ])
                 .then(preventOnFulfilled, function (reason) {
                     assert.equal(reason, error);
                 })
                 .then(done, testFailed(done));
         });
     });

     describe("4.4 Promise.reject", function () {
         it("returns a rejected Promise", function (done) {
             var error = new Error("rejected");
             var promise = Promise.reject(error);
             if (!promise instanceof Promise) {
                 done(new Error(assert(promise instanceof Promise)));
             }
             promise.then(preventOnFulfilled, function (reason) {
                 assert.equal(reason, error);
             })
                 .then(done, testFailed(done));
         });
     });

     describe("4.5 Promise.resolve", function () {
         it("returns a resolved Promise", function (done) {
             var p = new Thenable();
             var promise = Promise.resolve(p);
             if (!promise instanceof Promise) {
                 done(new Error(assert(promise instanceof Promise)));
             }
             promise.then(function (value) {
                 assert.equal(value, 1);
             })
                 .then(done, testFailed(done));
             p.resolve(1);
         });
         it("should return promise instanced passed as argument", function () {
             var p = Promise.resolve(1);
             assert.equal(p, Promise.resolve(p));
             assert.equal(p, Promise.cast(p));
         });
     });
 });

