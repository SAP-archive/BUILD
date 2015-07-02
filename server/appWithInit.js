'use strict';

var path = require('path');
var appServer = require('node-sap-app-server');
var configFile = path.join(__dirname, 'config.json');

var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === '--config') && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
}

var server = new appServer.Server(configFile);
server.initSchema(true)
    .then(function () {
        return server.start();
    })
