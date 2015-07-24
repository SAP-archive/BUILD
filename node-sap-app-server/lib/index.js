'use strict';

var util = require('util');
var constants = require('./constants');
require('./logger');

var appServer = {
    express: require('./express'),
    AppServer: require('./app-server'),
    Server: require('./server'),
    ServiceContainer: require('./service-container'),
    Loader: require('./loader')
};

util._extend(appServer, constants);
module.exports = appServer;
