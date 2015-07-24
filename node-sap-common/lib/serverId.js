'use strict';

var uuid = require('./uuid');
var singleton = require('./singleton');

var serverId = singleton.registerIfMissing('serverId', uuid());

module.exports = serverId;
