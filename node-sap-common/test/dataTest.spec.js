'use strict';

var expect = require('chai').expect;
var common = require('../index.js');

describe('data: basic test', function () {
    it('run', function () {
        expect(common.data).to.be.a('object');
    });

    it('clone', function () {
        var element, result;
        expect(common.data.clone).to.be.a('function');
        result = common.data.clone(element);

        expect(element).to.equal(result);

        element = [{a: 'a'}, {b: 'b'}, {c: [1, 2, 3]}, {d: [{s: 'q'}]}, {da: new Date()}];
        result = common.data.clone(element);

        expect(element).to.not.equal(result);
        expect(element).to.deep.equal(result);
    });

    it('copy', function () {
        var element, result;
        expect(common.data.copy).to.be.a('function');
        result = common.data.copy(element);

        expect(element).to.equal(result);

        element = [{a: 'a'}, {b: 'b'}, {c: [1, 2, 3]}, {d: [{s: 'q'}]}, {da: new Date()}];
        result = common.data.copy(element);

        expect(element).to.not.equal(result);
        expect(element).to.deep.equal(result);

        element = {a: 'a'};
        result = common.data.copy(element);

        expect(element).to.not.equal(result);
        expect(element).to.deep.equal(result);

        element = new Date();
        result = common.data.copy(element);

        expect(element).to.not.equal(result);
        expect(element.toDateString()).to.equal(result.toDateString());

        element = function () {
            return 'a';
        };
        result = common.data.copy(element);

        expect(element()).to.equal(result());
    });

    it('merge', function () {
        var target, add, result, expected;
        expect(common.data.merge).to.be.a('function');

        target = {};
        result = common.data.merge(target, add);

        expect(target).to.equal(result);

        target = {};
        add = {};
        result = common.data.merge(target, add);
        expected = target;

        expect(expected).to.deep.equal(result);

        target = {};
        add = {s: 'a', o: {s: 'b'}};
        result = common.data.merge(target, add);
        expected = {};
        expected.s = add.s;
        expected.o = add.o;

        expect(expected).to.deep.equal(result);

        target = {
            c: function () {
            }
        };
        add = {c: {s: 'c'}};
        result = common.data.merge(target, add);
        expected = {};
        expected.c = add.c;

        expect(expected).to.deep.equal(result);
    });

    it('extend', function () {
        var target, result, expected, el1, el2;
        expect(common.data.extend).to.be.a('function');

        result = common.data.extend(target);
        expected = {};

        expect(expected).to.deep.equal(result);

        target = function () {
            return 'v';
        };
        result = common.data.extend(target);
        expected = 'v';

        expect(expected).to.equal(result());

        target = 'v';
        result = common.data.extend(target);
        expected = {};

        expect(expected).to.deep.equal(result);

        target = {};
        el1 = {a: [1, 2, 3]};
        result = common.data.extend(target, el1);
        expected = el1;

        expect(expected).to.deep.equal(result);
        target = {};
        el1 = {a: [1, 2, 3]};
        el2 = {b: 'c'};
        result = common.data.extend(target, el1, el2);
        expected.a = el1.a;
        expected.b = el2.b;

        expect(expected).to.deep.equal(result);
    });

    it('shallowExtend', function () {
        var target, result, expected, el1, el2;
        expect(common.data.shallowExtend).to.be.a('function');

        result = common.data.shallowExtend(target);
        expected = {};

        expect(expected).to.deep.equal(result);

        target = function () {
            return 'v';
        };
        result = common.data.shallowExtend(target);
        expected = 'v';

        expect(expected).to.equal(result());

        target = 'v';
        result = common.data.shallowExtend(target);
        expected = {};

        expect(expected).to.deep.equal(result);

        target = {};
        el1 = {a: [1, 2, 3]};
        result = common.data.shallowExtend(target, el1);
        expected = el1;

        expect(expected).to.deep.equal(result);
        target = {};
        el1 = {a: [1, 2, 3]};
        el2 = {b: 'c'};
        result = common.data.shallowExtend(target, el1, el2);
        expected.a = el1.a;
        expected.b = el2.b;

        expect(expected).to.deep.equal(result);
    });
});
