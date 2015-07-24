'use strict';
var adminUsers = require('../server/index.js');
var expect = require('chai').expect;

describe('empty', function () {
    it('run', function () {
        expect(adminUsers).to.be.a('object');
    });
});
