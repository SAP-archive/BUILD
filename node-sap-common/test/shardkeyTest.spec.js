'use strict';

var expect = require('chai').expect;
var common = require('../index.js');

describe('shardkey: basic test', function () {
    it('run', function () {
        expect(common.shardkey).to.be.a('function');

        var result = common.shardkey();
        expect(result).to.be.a('string');

        expect(/^[0-9a-fA-F]{24}$/.test(result)).to.equal(true);
    });
});
