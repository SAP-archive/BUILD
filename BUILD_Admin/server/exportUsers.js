'use strict';

var path = require('path');
var AppServer = require('node-sap-app-server');
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var Promise = require('norman-promise');
var fs = require('fs');

var configFile = path.join(__dirname, 'config.json');
var outputFileName = path.join(__dirname, 'exportedUsers.json');

var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === '--config') && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
    if ((process.argv[k] === '--outputFileName') && (k < n - 1)) {
        outputFileName = process.argv[k + 1];
    }
}

var server = new AppServer.Server(configFile);
server.startMaintenanceMode()
    .then(function () {
        var userService = registry.getModule('UserService');
        return userService.filteredList('-_id name email principal provider', { provider: { $ne: 'local'}});
    })
    .then(function (users) {
        return Promise.invoke(fs.writeFile, outputFileName, JSON.stringify(users, null, '    '), {encoding: 'utf-8'});
    })
    .catch(function (error) {
        serverLogger.error(error, 'Failed to exports users');
        throw error;
    })
    .always(function () {
        server.appServer.shutdown();
    });
