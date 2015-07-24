'use strict';

var expect = require('chai').expect;
var common = require('../index.js');

describe('uuid: basic test', function () {
    it('run', function () {
        expect(common.uuid).to.be.a('function');

        var result = common.uuid();
        expect(result).to.be.a('string');

        expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(result)).to.equal(true);
    });
});
