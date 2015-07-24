'use strict';
var expect = require('chai').expect;
var cipher = require('../index.js').cipher;

var password = 'It\'s a kind of magic';

function testPassed(done) {
    return function () {
        done();
    };
}
function testFailed(done) {
    return function (err) {
        done(err);
    };
}
/*
function preventOnFulfilled() {
    throw new Error('Promise should not be fulfilled');
}
*/

describe('cipher', function () {
    this.slow(100);
    describe('.createCipherInit', function () {
        it('should create cipher initialization data', function (done) {
            cipher.createCipherInit(password)
                .then(function (init) {
                    expect(Buffer.isBuffer(init.key)).to.be.true;
                    expect(Buffer.isBuffer(init.iv)).to.be.true;
                    expect(Buffer.isBuffer(init.salt)).to.be.true;
                    expect(init.key.toString('hex').length).to.equal(64);
                    expect(init.iv.toString('hex').length).to.equal(32);
                    expect(init.salt.toString('hex').length).to.equal(64);
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should have a deterministic output for given password, salt and derivation options', function (done) {
            var cipherInit;
            cipher.createCipherInit(password)
                .then(function (init) {
                    expect(Buffer.isBuffer(init.key)).to.be.true;
                    expect(Buffer.isBuffer(init.iv)).to.be.true;
                    expect(Buffer.isBuffer(init.salt)).to.be.true;
                    cipherInit = {
                        key: init.key.toString('hex'),
                        iv: init.iv.toString('hex'),
                        salt: init.salt.toString('base64')
                    };
                    expect(cipherInit.iv.length).to.equal(32);
                    expect(cipherInit.key.length).to.equal(64);
                    expect(init.salt.toString('hex').length).to.equal(64);
                    return cipher.createCipherInit(password, cipherInit.salt);
                })
                .then(function (init) {
                    expect(init.key.toString('hex')).to.equal(cipherInit.key);
                    expect(init.iv.toString('hex')).to.equal(cipherInit.iv);
                })
                .then(testPassed(done), testFailed(done));
        });

    });
    describe('.createCipher', function () {

    });
    describe('.createDecipher', function () {

    });
});
