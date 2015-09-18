/*eslint no-process-exit: 0*/
'use strict';

var path = require('path');
var AppServer = require('node-sap-app-server');
var commonServer = require('norman-common-server');

var INIT_TIMEOUT = 480;


var configFile = path.join(__dirname, 'config.json');

var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === '--config') && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
}

var server = new AppServer.Server(configFile);
server.initSchema()
    .setTimeout(INIT_TIMEOUT * 1000, function () {
        var logger = commonServer.logging.createLogger('server');
        logger.error('Database initSchema timeout, closing process.');
        throw new Error('Timeout expired');
    });
