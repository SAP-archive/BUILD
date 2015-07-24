'use strict';

var path = require('path');
var AppServer = require('node-sap-app-server');
var commonServer = require('norman-common-server');
var registry = commonServer.registry;

var configFile = path.join(__dirname, 'config.json');
var authority;

var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === '--config') && (k < n - 1)) {
        configFile = process.argv[k + 1];
        defaultConfigFile = false;
    }
    if ((process.argv[k] === '--authority') && (k < n - 1)) {
        authority = process.argv[k + 1];
    }
}

var server = new AppServer.Server(configFile);
server.startMaintenanceMode()
        .then(function () {
            var userService = registry.getModule('UserService');
            return userService.updateUserPrincipal(authority);
        })
        .catch(function (error) {
            serverLogger.error(error, 'Failed to update user principal');
            throw error;
        })
        .always(function () {
            server.appServer.shutdown();
       });


