'use strict';
var crypto = require('crypto');

function logAndThrow(logger, message, err) {
    var error = new Error(message);
    if (err) {
        error.inner = err;
        logger.error(err, message);
    }
    else {
        logger.error(message);
    }
    throw error;
}

function encodeData(data) {
    var result = {};
    if (Buffer.isBuffer(data)) {
        result.buffer = data;
        result.type = 'buffer';
    }
    else {
        switch (typeof data) {
            case 'object':
                result.buffer = new Buffer(JSON.stringify(data));
                result.type = 'object';
                break;
            case 'string':
                result.buffer = new Buffer(data);
                result.type = 'string';
                break;
            default:
                throw new TypeError('Unsupported data type');
        }
    }
    return result;
}

function decodeData(buffer, type) {
    var result;
    switch (type) {
        case 'buffer':
            result = buffer;
            break;
        case 'object':
            result = JSON.parse(buffer.toString());
            break;
        case 'string':
            result = buffer.toString();
            break;
        default:
            throw new TypeError('Unsupported data type');
    }
    return result;
}

function encryptData(params, data) {
    var cipher = crypto.createCipheriv(params.algorithm, params.key, params.iv);
    var encodedData = encodeData(data);
    var cipherData = cipher.update(encodedData.buffer, 'buffer', 'base64');
    cipherData += cipher.final('base64');
    return {
        data: cipherData,
        type: encodedData.type
    };
}

function decryptData(params, encryptedData) {
    var decipher = crypto.createDecipheriv(params.algorithm, params.key, params.iv);
    var buffer = decipher.update(encryptedData.data, 'base64');
    buffer = Buffer.concat([buffer, decipher.final() ]);
    return decodeData(buffer, encryptedData.type);
}

function encryptString(params, clearText) {
    var cipher = crypto.createCipheriv(params.algorithm, params.key, params.iv);
    var cipherText = cipher.update(clearText, 'utf-8', 'base64');
    cipherText += cipher.final('base64');
    return cipherText;
}

function decryptString(params, cipherText) {
    var decipher = crypto.createDecipheriv(params.algorithm, params.key, params.iv);
    var clearText = decipher.update(cipherText, 'base64', 'utf-8');
    clearText += decipher.final('utf-8');
    return clearText;
}

module.exports = {
    decodeData: decodeData,
    encodeData: encodeData,
    decryptData: decryptData,
    encryptData: encryptData,
    decryptString: decryptString,
    encryptString: encryptString,
    logAndThrow: logAndThrow
};
