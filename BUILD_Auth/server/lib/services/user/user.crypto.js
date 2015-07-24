'use strict';
/*jshint bitwise: false */
var util = require('util');
var crypt = require('crypto');

var commonServer = require('norman-common-server');

var securityConfig = commonServer.config.get('security') || {};
var cryptoConfig = util._extend({
    saltLength: 32,
    keyLength: 32,
    iterations: 10000
}, securityConfig.crypto);

var SALT_LENGTH = cryptoConfig.saltLength;
var KEY_LENGTH = cryptoConfig.keyLength;
var ITERATIONS = cryptoConfig.iterations;


var pbkdf2 = crypt.pbkdf2;
var pbkdf2Sync = crypt.pbkdf2Sync;

if ((/^v0\.10/).test(process.version)) {
    // In 0.10.x, digest option not supported (hard-coded to SHA1)
    pbkdf2 = function (password, salt, iterations, keylen, digest, callback) {
        return crypt.pbkdf2(password, salt, iterations, keylen, callback);
    };
    pbkdf2Sync = function (password, salt, iterations, keylen) {
        return crypt.pbkdf2Sync(password, salt, iterations, keylen);
    };
}


/**
 * Generate salt
 * @param {Function} cb - if callback is present - execute as async function
 */
function generateSalt(cb) {
    if (typeof cb !== 'function') {
        return new Buffer(crypt.randomBytes(SALT_LENGTH)).toString('hex');
    }
    crypt.randomBytes(SALT_LENGTH, function (err, buf) {
        cb(err, err ? null : buf.toString('hex'));
    });
}


/**
 * Generate hash
 * @param {String} - pass
 * @param {String} - salt
 * @param {Function} cb - if callback is present - execute as async function
 */
function hash(pass, salt, cb) {
    if (typeof cb !== 'function') {
        return pbkdf2Sync(pass, salt, ITERATIONS, KEY_LENGTH, 'sha256').toString('hex');
    }
    pbkdf2(pass, salt, ITERATIONS, KEY_LENGTH, 'sha256', function (err, buf) {
        cb(err, err ? null : buf.toString('hex'));
    });
}


/**
 * Compare password_hash.
 * @param {String} pass - password to compare
 * @param {String} hashed - hashed password
 * @param {String} salt - salt used to hash the hashed
 * @param {Function} cb - if callback is present - execute as async function
 */
function compare(pass, hashed, salt, cb) {
    if (typeof cb !== 'function') {
        return hashed === hash(pass, salt);
    }
    hash(pass, salt, function (err, buf) {
        cb(err, err ? null : hashed === buf.toString('hex'));
    });
}

exports.iterationCount = ITERATIONS;
exports.generateSalt = generateSalt;
exports.hash = hash;
exports.compare = compare;
