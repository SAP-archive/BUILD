'use strict';

var path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

var config = 'config.test.json';

console.log('Starting in mode: ' + process.env.NODE_ENV);

var configFile = path.join(__dirname, config);
var normanAppServer = require('node-sap-app-server');
var Server = normanAppServer.Server;
var AppServer = normanAppServer.AppServer;

var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === "--config") && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
}

var server = new Server(configFile);
normanAppServer.AppServer = new AppServer(server.config);

module.exports = normanAppServer;
