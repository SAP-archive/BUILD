'use strict';

var chai = require("norman-testing-tp").chai;
var expect = chai.expect;

describe('Prototype Service Config - Test', function () {

        before(function (done) {
            done();
        });

        after(function (done) {
            done();
        });

        it('config - maximum number of versions ', function (done) {
            var config = require("../../config/prototypeConfig");
            expect(config).not.to.be.equal(undefined);
            expect(config.maximumNumberOfVersions).to.be.equal(20);
            done();
        });

});
