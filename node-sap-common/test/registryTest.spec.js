'use strict';

var expect = require('chai').expect;
var common = require('../index.js');
var registry = common.registry;
var fooService = {};

describe('Registry', function () {
    beforeEach(function () {
        registry.unregisterModule('foo');
    });

    describe('getModule', function () {
        it('should throw an exception if the module is not defined', function () {
            expect(function () {
                registry.getModule('non-existing');
            }).to.throw(Error);
        });
        it('should return an existing module', function () {
            registry.registerModule(fooService, 'foo');
            expect(registry.getModule('foo')).to.equal(fooService);
        });
    });

    describe('lookupModule', function () {
        it('should return undefined for a missing module', function () {
            expect(registry.lookupModule('non-existing')).to.be.undefined; // eslint-disable-line no-unused-expressions
        });
        it('should return an existing module', function () {
            registry.registerModule(fooService, 'foo');
            expect(registry.lookupModule('foo')).to.equal(fooService);
        });
    });

    describe('registerModule', function () {
        it('should register a module', function () {
            expect(registry.lookupModule('foo')).to.be.undefined; // eslint-disable-line no-unused-expressions
            registry.registerModule(fooService, 'foo');
            expect(registry.lookupModule('foo')).to.equal(fooService);
        });

        it('should register a undefined module', function () {
            expect(registry.lookupModule('foo')).to.be.undefined; // eslint-disable-line no-unused-expressions
            try {
                registry.registerModule(undefined, 'foo');
            }
            catch (error) {
                expect(error.toLocaleString()).to.equal('Error: Invalid module "foo"');
                expect(registry.lookupModule('foo')).to.be.undefined; // eslint-disable-line no-unused-expressions
            }
        });

        it('should register a module without name', function () {
            try {
                registry.registerModule(fooService);
            }
            catch (error) {
                expect(error.toLocaleString()).to.equal('Error: Missing module name');
            }
        });
    });

    describe('unregisterModule', function () {
        it('should unregister a module', function () {
            registry.registerModule(fooService, 'foo');
            expect(registry.lookupModule('foo')).to.equal(fooService);
            registry.unregisterModule('foo');
            expect(registry.lookupModule('foo')).to.be.undefined; // eslint-disable-line no-unused-expressions
        });
    });
});
