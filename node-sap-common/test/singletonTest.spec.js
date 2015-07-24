'use strict';

var expect = require('chai').expect;
var common = require('../index.js');

var ELEMENT = {a: 'a'};

var singleton = common.singleton;

var otherSingletonPath = require.resolve('../logs/singleton');
function getOtherSingleton() {
    if (require.cache[otherSingletonPath]) {
        delete require.cache[otherSingletonPath];
    }
    return require(otherSingletonPath);
}

function resetSharedState() {
    var k, n, keys = Object.keys(global._nodeSapShared);
    n = keys.length;
    for (k = 0; k < n; ++k) {
        delete global._nodeSapShared[keys[k]];
    }
}

describe('singleton', function () {
    beforeEach(resetSharedState);

    describe('singleton: basic test', function () {
        it('run', function () {
            expect(common.singleton).to.be.a('object');
        });

        it('get', function () {
            var result;
            expect(common.singleton.get).to.be.a('function');
            result = common.singleton.get('toto');
            expect(result).to.equal(undefined);
        });

        it('register', function () {
            var result;
            expect(common.singleton.register).to.be.a('function');

            common.singleton.register('toto', ELEMENT);
            result = common.singleton.get('toto');
            expect(result).to.deep.equal(ELEMENT);

            try {
                common.singleton.register('toto', ELEMENT);
            }
            catch (error) {
                expect(error.toString()).to.equal('Error: Singleton "toto" already registered');
                result = common.singleton.get('toto');
                expect(result).to.deep.equal(ELEMENT);
            }
        });

        it('registerIfMissing', function () {
            var result;
            expect(common.singleton.registerIfMissing).to.be.a('function');

            common.singleton.registerIfMissing('registerIfMissing', ELEMENT);
            result = common.singleton.get('registerIfMissing');
            expect(result).to.deep.equal(ELEMENT);

            common.singleton.registerIfMissing('registerIfMissing');
            result = common.singleton.get('registerIfMissing');
            expect(result).to.deep.equal(ELEMENT);
        });

        it('unregister', function () {
            var result;
            expect(common.singleton.unregister).to.be.a('function');

            common.singleton.register('unregister', ELEMENT);
            result = common.singleton.get('unregister');
            expect(result).to.deep.equal(ELEMENT);

            common.singleton.unregister('unregister');
            result = common.singleton.get('unregister');
            expect(result).to.equal(undefined);
        });

        it('declare', function () {
            var result, fn, index = 0;
            expect(common.singleton.declare).to.be.a('function');

            result = common.singleton.declare('declare', ELEMENT);
            expect(result).to.deep.equal(ELEMENT);

            result = common.singleton.registerIfMissing('declareI', ELEMENT);
            result = common.singleton.declare('declareI', ELEMENT);
            expect(result).to.deep.equal(ELEMENT);

            fn = function () {
                return index++;
            };

            result = common.singleton.declare('declareFn', fn);
            expect(result).to.be.a('object');
            expect(index).to.equal(1);
        });
    });

    describe('shared state', function () {
        it('should exist', function () {
            expect(global._nodeSapShared).to.be.an('object');
        });
        it('should not be overwritten by another singleton instance', function () {
            global._nodeSapShared.foo = 'bar';
            getOtherSingleton();
            expect(global._nodeSapShared.foo).to.equal('bar');
        });
    });

    describe('get', function () {
        it('should return undefined for an invalid key', function () {
            expect(singleton.get('non-existing')).to.be.undefined; // eslint-disable-line no-unused-expressions
        });
        it('should return an existing singleton', function () {
            global._nodeSapShared.foo = 'bar';
            expect(singleton.get('foo')).to.equal('bar');
        });
    });

    describe('register', function () {
        it('should throw an exception for a key already in use', function () {
            global._nodeSapShared.foo = undefined;
            expect(function () {
                singleton.register('foo', 'other');
            }).to.throw(Error);
            expect(singleton.get('foo')).to.be.undefined; // eslint-disable-line no-unused-expressions
        });
        it('should register a singleton', function () {
            expect(singleton.get('foo')).to.be.undefined; // eslint-disable-line no-unused-expressions
            getOtherSingleton().register('foo', 'bar');
            expect(singleton.get('foo')).to.equal('bar');
        });
    });

    describe('unregister', function () {
        it('should unregister a singleton', function () {
            singleton.register('foo', 'bar');
            expect(singleton.get('foo')).to.equal('bar');
            getOtherSingleton().unregister('foo');
            expect(singleton.get('foo')).to.be.undefined; // eslint-disable-line no-unused-expressions
        });
    });

    describe('declare', function () {
        function Foo() {
        }

        it('should register a singleton instance if it does not exist', function () {
            expect(singleton.get('foo')).to.be.undefined; // eslint-disable-line no-unused-expressions
            singleton.declare('foo', Foo);
            expect(singleton.get('foo')).to.be.instanceof(Foo);
        });
        it('should return the existing singleton instance if it exists', function () {
            singleton.declare('foo', Foo);
            var foo = singleton.get('foo');
            expect(singleton.declare('foo', Foo)).to.equal(foo);
        });
    });
});
