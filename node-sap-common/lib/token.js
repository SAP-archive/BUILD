'use strict';

var crypto = require('crypto');

var bufferSize = 512, index = 0, buffer = crypto.randomBytes(bufferSize);

function createToken(size) {
    var token;
    if (size > bufferSize) {
        return crypto.randomBytes(size).toString('hex');
    }

    if (index + size > bufferSize) {
        buffer = crypto.randomBytes(bufferSize);
        index = 0;
    }
    token = buffer.toString('hex', index, index + size);
    index += size;
    return token;
}

module.exports = createToken;
