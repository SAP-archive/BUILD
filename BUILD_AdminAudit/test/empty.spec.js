'use strict';
var adminAudit = require('../server/index.js');
var expect = require('chai').expect;

describe('empty', function () {
    it('run', function () {
        expect(adminAudit).to.be.a('object');
    });
});
