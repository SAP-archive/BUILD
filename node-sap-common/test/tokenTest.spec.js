'use strict';

var expect = require('chai').expect;
var common = require('../index.js');

describe('token: basic test', function () {
    it('run', function () {
        expect(common.token).to.be.a('function');
    });

    it('token: size < 512', function () {
        expect(common.token).to.be.a('function');

        var size = 90, result;
        result = common.token(size);
        expect(result).to.be.a('string');
    });

    it('token: size > 512', function () {
        expect(common.token).to.be.a('function');

        var size = 513, result;
        result = common.token(size);
        expect(result).to.be.a('string');
    });

    it('token', function () {
        expect(common.token).to.be.a('function');

        var size = 510, result;
        result = common.token(size);
        expect(result).to.be.a('string');
    });
});
