var assert = require("chai").assert;
var Promise = require("./promise");

// ------------------------------------------------------------
//      5 Promise prototype properties
// ------------------------------------------------------------
describe("5 Promise prototype properties", function () {
    describe("5.1 id", function () {
        it("should be defined on each Promise", function () {
            var p1 = new Promise(function () {});
            var p2 = new Promise(function () {});
            assert.isDefined(p1.id);
            assert.notEqual(p1.id, p2.id);
        });
    });
    describe("5.2 value", function () {
        it("should be defined when a promise is settled", function () {
            var err = new Error("rejected");
            var p1 = new Promise(function () {});
            var p2 = Promise.resolve(42);
            var p3 = Promise.reject(err);
            assert.isUndefined(p1.result);
            assert.equal(p2.value, 42);
            assert.equal(p3.value, err);
        });
    });
    describe("5.3 status", function () {
        it("should be defined on each Promise", function () {
            var err = new Error("rejected");
            var p1 = new Promise(function () {});
            var p2 = Promise.resolve(42);
            var p3 = Promise.reject(err);
            assert.equal(p1.status, Promise.PENDING);
            assert.equal(p2.status, Promise.FULFILLED);
            assert.equal(p3.status, Promise.REJECTED);
        });
    });
    describe("5.4 statusText", function () {
        it("should be defined on each Promise", function () {
            var err = new Error("rejected");
            var p1 = new Promise(function () {});
            var p2 = Promise.resolve(42);
            var p3 = Promise.reject(err);
            assert.equal(p1.statusText, "pending");
            assert.equal(p2.statusText, "fulfilled");
            assert.equal(p3.statusText, "rejected");
        });
    });
});
