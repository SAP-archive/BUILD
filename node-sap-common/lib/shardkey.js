'use strict';

var token = require('./token');
var tmpBuf = new Buffer(4); // as node is single-threaded, we may use a pre-allocated static buffer

function shardkey() {
    var ts = ((Date.now() - 1262300400000) / 1000) & 0xffffffff;
    tmpBuf.writeUInt32BE(ts, 0, true);
    return token(8) + tmpBuf.toString('hex');
}

module.exports = shardkey;
