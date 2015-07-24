'use strict';

var expect = require('chai').expect;
var common = require('../index.js');

describe('serverId: basic test', function () {
    it('run', function () {
        expect(common.serverId).to.be.a('string');
    });
});
