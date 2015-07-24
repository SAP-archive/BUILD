'use strict';

// Cryptographically strong type 4 UUID

var token = require('./token');

var uuidY = {
    0: '8',
    1: '9',
    2: 'a',
    3: 'b',
    4: '8',
    5: '9',
    6: 'a',
    7: 'b',
    8: '8',
    9: '9',
    a: 'a',
    b: 'b',
    c: '8',
    d: '9',
    e: 'a',
    f: 'b'
};

function uuid() {
    var mid = token(2);
    var end = token(8);
    return token(4) + '-' + token(2) + '-' + '4' + mid.slice(0, 3) + '-' + uuidY[mid[3]] + end.slice(0, 3) + '-' + end.slice(3, 15);
}

module.exports = uuid;
