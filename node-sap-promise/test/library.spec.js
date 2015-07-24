var expect = require("chai").expect;
var clearPromise = require("./helper/clear-promise.js");


describe("Promise Library", function () {
    it("should define a global Promise object", function () {
        clearPromise();
        process.env.SAP_PROMISES = 1;
        require("../index.js");
        expect(Promise).to.be.a("function");
        var p = new Promise(function () {});
        expect(p).to.be.an("object");
    });

    it("should enhance an existing global Promise object", function () {
        clearPromise();
        var CustomPromise = require("../lib/promise.js");
        global.Promise = CustomPromise;
        expect(Promise.invoke).to.be.undefined;
        require("../index.js");
        expect(Promise).to.exist;
        expect(Promise).to.equal(CustomPromise);
    });

});