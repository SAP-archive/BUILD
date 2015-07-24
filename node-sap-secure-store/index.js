"use strict";
var fs = require("fs");
var crypto = require("crypto");
var util = require("util");
require("node-sap-promise");

var pbkdf2 = crypto.pbkdf2;
var defaultOptions = {
    algorithm: "aes-256-cbc",
    keyLength: 32,
    ivLength: 16,
    digest: "sha256",
    iterationCount: 10000,
    fileMode: 420  // default file mode 644
};

if ((/^v0\.10/).test(process.version)) {
    // In 0.10.x, digest option not supported (hard-coded to SHA1)
    defaultOptions.digest = "sha1";
    pbkdf2 = function (password, salt, iterations, keylen, digest, callback) {
        // digest no supported on 0.10.x
        return crypto.pbkdf2(password, salt, iterations, keylen, callback);
    };
}

function encodeData(data, encoding) {
    var result = {};
    if (Buffer.isBuffer(data)) {
        result.buffer = data;
        result.type = "buffer";
    }
    else {
        switch (typeof data) {
            case "object":
                result.buffer = new Buffer(JSON.stringify(data));
                result.type = "object";
                break;
            case "string":
                encoding = encoding || "utf-8";
                result.buffer = new Buffer(data, encoding);
                result.type = "string";
                result.encoding = encoding;
                break;
            default:
                throw new TypeError("Unsupported data type");
        }
    }
    return result;
}

function decodeData(buffer, type, encoding) {
    var result;
    switch (type) {
        case "buffer":
            result = buffer;
            break;
        case "object":
            result = JSON.parse(buffer.toString());
            break;
        case "string":
            result = buffer.toString(encoding);
            break;
        default:
            throw new TypeError("Unsupported data type");
    }
    return result;
}

function checkStore(store) {
    var props = [ "algorithm", "keyLength", "ivLength", "digest", "salt", "iterationCount", "type", "data" ];
    var k, n = props.length;
    for (k = 0; k < n; ++k) {
        if (!store[props[k]]) {
            throw new TypeError("Invalid encrypted configuration, \"" + props[k] + "\" property is missing");
        }
    }
}

/**
 * Read encrypted, password protected configuration data
 * @param {string} filename Encrypted configuration file
 * @param {string} [password] Password
 * @returns {Promise} Promise eventually fulfilled with the configuration data
 * @public
 */
function readSecureData(filename, password) {
    var store = {};
    password = password || "";
    return Promise.invoke(fs.readFile, filename, { encoding: "utf-8" })
        .then(function (content) {
            store = JSON.parse(content);
            checkStore(store);
            var pwdBuffer = new Buffer(password);
            var salt = new Buffer(store.salt, "base64");
            return Promise.invoke(pbkdf2, pwdBuffer, salt, store.iterationCount, store.keyLength + store.ivLength, store.digest);
        })
        .then(function (kiv) {
            var key = kiv.slice(0, store.keyLength);
            var iv = kiv.slice(store.keyLength);
            var decipher = crypto.createDecipheriv(store.algorithm, key, iv);
            var buffer = decipher.update(store.data, "base64");
            buffer = Buffer.concat([buffer, decipher.final() ]);
            return decodeData(buffer, store.type, store.encoding);
        });
}

/**
 * Write encrypted, password protected configuration data
 * @param {string} filename Encrypted configuration file
 * @param {object|string|buffer} data Configuration data
 * @param {string} [password] Password
 * @param {object} [customOptions] Custom options
 * @returns {Promise}
 * @public
 */
function writeSecureData(filename, data, password, customOptions) {
    var options, pwdBuffer, salt;
    if (typeof password === "object") {
        customOptions = password;
        password = undefined;
    }
    password = password || "";
    try {
        options = util._extend({}, module.exports.options);
        options = util._extend(options, customOptions);
        pwdBuffer = new Buffer(password);
        salt = crypto.randomBytes(options.keyLength + options.ivLength); // Salt entropy should match key + IV
        return Promise.invoke(pbkdf2, pwdBuffer, salt, options.iterationCount, options.keyLength + options.ivLength, options.digest)
            .then(function (kiv) {
                var key = kiv.slice(0, options.keyLength);
                var iv = kiv.slice(options.keyLength);
                var cipher = crypto.createCipheriv(options.algorithm, key, iv);
                var encodedData = encodeData(data);
                var cipherData = cipher.update(encodedData.buffer, "buffer", "base64");
                cipherData += cipher.final("base64");
                var store = {
                    algorithm: options.algorithm,
                    keyLength: options.keyLength,
                    ivLength: options.ivLength,
                    digest: options.digest,
                    salt: salt.toString("base64"),
                    iterationCount: options.iterationCount,
                    type: encodedData.type,
                    encoding: encodedData.encoding,
                    data: cipherData
                };
                return Promise.invoke(fs.writeFile, filename, JSON.stringify(store, null, "  "), { mode: options.fileMode });
            });
    }
    catch (err) {
        return Promise.reject(err);
    }
}

/**
 * Encrypt a JSON configuration file
 * @param {string} filename JSON configuration file to encrypt
 * @param {string} [password] Password
 * @returns {Promise}
 * @public
 */
function cryptJSON(filename, password, customOptions) {
    return Promise.invoke(fs.readFile, filename, { encoding: "utf-8" })
        .then(function (content) {
            var data = JSON.parse(content);
            return writeSecureData(filename, data, password, customOptions);
        });
}

/**
 * Decrypt a JSON configuration file
 * @param {string} filename JSON configuration file to decrypt
 * @param {string} [password] Password
 * @returns {Promise}
 * @public
 */
function decryptJSON(filename, password, indentLevel) {
    return readSecureData(filename, password)
        .then(function (data) {
            return Promise.invoke(fs.writeFile, filename, JSON.stringify(data, null, indentLevel));
        });
}

/**
 * @module node-sap-secure-store
 * @property {object} options Default encryption options
 * @property {string} options.algorithm Encryption algorithm (default "aes-256-cbc")
 * @property {number} options.keyLength Key length in bytes (default 32)
 * @property {number} options.ivLength Initialization Vector length in bytes (default 16)
 * @property {string} options.digest Hash algorithm for PBKDF2 derivation of key and IV from password (on node 0.10.x only sha1 is supported)
 * @property {number} options.iterationCount PBKDF2 iteration count for key and IV derivation (default 10000)
 * @property {number} options.fileMode Configuration file mode if created (default 420, i.e. octal 644)
 */
module.exports = {
    options: defaultOptions,
    cryptJSON: cryptJSON,
    decryptJSON: decryptJSON,
    readSecureData: readSecureData,
    writeSecureData: writeSecureData
};
