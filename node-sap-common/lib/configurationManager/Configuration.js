'use strict';

var fs = require('fs');
var path = require('path');

var data = require('../data.js');

function loadConfig(configFile) {
    return JSON.parse(fs.readFileSync(configFile, {encoding: 'utf-8'}));
}

function Configuration(config) {
    var cwd, k, n, keys, key, value;
    config = config || {};

    switch (typeof config) {
        case 'string':
            config = path.resolve(process.cwd(), config);
            cwd = path.dirname(config);
            config = loadConfig(config);
            cwd = config.cwd || cwd;
            break;
        case 'object':
            cwd = config.cwd || process.cwd();
            config = data.clone(config);
            break;
        default:
            throw new TypeError('Invalid configuration');
    }

    this.cwd = cwd;

    keys = Object.keys(config);
    n = keys.length;
    for (k = 0; k < n; ++k) {
        key = keys[k];
        if (key === 'cwd') {
            continue;
        }
        value = config[key];
        if (typeof value === 'string') {
            this[key] = loadConfig(path.resolve(cwd, value));
        }
        else {
            this[key] = value;
        }
    }
}

module.exports = Configuration;
