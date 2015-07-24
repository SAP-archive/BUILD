'use strict';

var appServer = require('node-sap-app-server');

var path = require('path');
var config = path.join(__dirname, 'config-test.json');

var server = new appServer.Server(config);
server.start().then(function () {
    server.appServer.initSchema();
});