/*eslint no-process-exit: 0*/
'use strict';

var path = require('path');
var AppServer = require('node-sap-app-server');
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var INIT_TIMEOUT = 120;
var Promise = require('norman-promise');

var configFile = path.join(__dirname, 'config.json');

var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === '--config') && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
}

var server = new AppServer.Server(configFile);
server.checkSchema()
    .setTimeout(INIT_TIMEOUT * 1000, function () {
        var logger = commonServer.logging.createLogger('server');
        logger.error('Database checkSchema timeout, closing process.');
        throw new Error("Timeout expired");
    });
