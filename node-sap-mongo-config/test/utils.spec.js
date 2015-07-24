'use strict';
require('node-sap-promise');
var expect = require('chai').expect;

var mongoConfig = require('../index.js');
var utils = require('../lib/utils.js');

var logger = mongoConfig.options.logger;
var logAndThrow = utils.logAndThrow;

describe('utils', function () {
    describe('logAndThrow', function () {
        it('should throw an Error', function () {
            expect(function () {
                return logAndThrow(logger, 'Some error');
            }).to.throw(Error);
        });
        it('should throw an Error wrapping a given inner error', function () {
            var inner = new Error('Inner error'), error;
            try {
                logAndThrow(logger, 'Top level error', inner);
            }
            catch(err) {
                error = err;
            }
            expect(error).to.be.defined;
            expect(error.inner).to.equal(inner);
        });
    });
});
