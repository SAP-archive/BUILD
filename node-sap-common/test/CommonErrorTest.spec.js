'use strict';

var expect = require('chai').expect;
var common = require('../index.js');
var CommonError = common.CommonError;

function errorThrow(msg, code) {
    var err = new Error(msg);
    if (code) {
        err.code = code;
    }
    throw err;
}

function commonThrow(options, innerCall) {
    var inner;
    try {
        if (typeof innerCall === 'function') {
            innerCall();
        }
        if (innerCall instanceof Error) {
            inner = innerCall;
        }
    }
    catch (err) {
        inner = err;
    }
    inner = new CommonError(options.message, options.code, options.target, inner);
    throw inner;
}

describe('CommonError', function () {
    it('should serialize to an OData response not disclosing any information', function () {
        var options = {
            message: 'Oops no magic today!',
            code: 503
        };
        CommonError.debugMode = false;
        try {
            commonThrow(options, function () {
                errorThrow('I am a low level error', 'ENOSTAT');
            });
        }
        catch (err) {
            var json = err.toJSON();
            expect(Object.keys(json)).to.have.length(1);
            expect(json.error).to.be.an('object');
            expect(json.error.message).to.equal(options.message);
            expect(json.error.code).to.equal(options.code);
            expect(json.error.details).to.be.undefined; // eslint-disable-line no-unused-expressions
        }
    });
    it('should serialize to a detailed OData response in debug mode', function () {
        var options = {
            message: 'Oops no magic today!',
            code: 503
        };
        CommonError.debugMode = true;
        try {
            commonThrow(options, function () {
                errorThrow('I am a low level error', 'ENOSTAT');
            });
        }
        catch (err) {
            var json = err.toJSON();
            expect(Object.keys(json)).to.have.length(1);
            expect(json.error).to.be.an('object');
            expect(json.error.message).to.equal(options.message);
            expect(json.error.code).to.equal(options.code);
            expect(json.error.details).to.have.length(1);
            expect(json.error.details[0].code).to.equal('ENOSTAT');
            expect(json.error.innererror).to.be.an('object');
        }
    });
});
