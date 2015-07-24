'use strict';

var expect = require('chai').expect;
var mongo = require('../index.js');

describe('mongo: basic test', function () {
    it('run', function () {
        expect(mongo).to.be.a('object');
    });

    it('setLogger', function () {
        expect(mongo.ConnectionManager.setLogger).to.be.a('function');
        mongo.ConnectionManager.setLogger(undefined);

        expect(mongo.ConnectionManager.getLogger()).to.deep.equal(undefined);


        var op = {
            limits: {
                fields: 150
            }
        };

        mongo.ConnectionManager.setLogger(op);
        expect(mongo.ConnectionManager.getLogger()).to.deep.equal(op);
    });
});
