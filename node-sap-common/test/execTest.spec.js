'use strict';

var expect = require('chai').expect;
var common = require('../index.js');

describe('exec: basic test', function () {
    it('run', function () {
        expect(common.exec).to.be.a('function');
    });

    it('exec', function (done) {
        expect(common.exec).to.be.a('function');
        common.exec('cd')
            .then(function (result) {
                expect(result).to.be.a('object');
                done();
            })
            .catch(done);

    });

    it('exec with option', function (done) {
        var info = [], error = [], debug = [], serviceLogger = {
            info: function (msg) {
                info.push(msg);
            },
            error: function (msg) {
                error.push(msg);
            },
            debug: function (msg) {
                debug.push(msg);
            }
        };

        common.exec('cd', {stdio: 'false', logger: serviceLogger})
            .then(function (result) {
                expect(result).to.be.a('object');
                expect(info.length).to.equal(0);
                expect(error.length).to.equal(0);
                expect(debug[0]).to.equal('exec cd');
                done();
            })
            .catch(done);

    });

    it('exec with string for option', function (done) {
        expect(common.exec).to.be.a('function');

        common.exec('cd', '')
            .then(function (result) {
                expect(result).to.be.a('object');
                done();
            })
            .catch(done);

    });

    it('exec with callback', function (done) {
        expect(common.exec).to.be.a('function');

        common.exec('cd', function (error, result) {
            if (error) {
                done(error);
            }
            else {
                expect(result).to.be.a('object');
                done();
            }
        });
    });

    it('exec with error', function (done) {
        expect(common.exec).to.be.a('function');

        common.exec('cdwwww')
            .then(function () {
                done('error');
            })
            .catch(function (error) {
                expect(error).to.be.a('object');

                done();
            });

    });
});
