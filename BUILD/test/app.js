'use strict';
var fs = require('fs');
var normanAppServer = require('norman-app-server');
var Server = normanAppServer.Server;
var AppServer = normanAppServer.AppServer;

var path = require('path');
var configFile = path.join(__dirname, 'config.json');
if (!fs.existsSync(configFile)) {
    configFile = path.join(__dirname, 'test/config.json'); // debug run
}

var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === "--config") && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
}

var server = new Server(configFile);
normanAppServer.AppServer= new AppServer(server.config);

module.exports = normanAppServer;