'use strict';
var path = require('path');
var config = process.env.NODE_ENV === 'test' ? 'config.test.json' : 'config.json';
var configFile = path.join(__dirname, config);

var appServer = require('node-sap-app-server');

var server = new appServer.Server(configFile);
server.start().then(function () {
    server.appServer.initSchema();
});

