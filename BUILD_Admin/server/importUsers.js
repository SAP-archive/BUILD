'use strict';

var path = require('path');
var AppServer = require('node-sap-app-server');
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var fs = require('fs');

var configFile = path.join(__dirname, 'config.json');
var inputFileName = path.join(__dirname, 'exportedUsers.json');

var importContext = {
    ip: '::1',
    user: {
        _id: '0',
        name: 'ADMIN'
    }
};

var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === '--config') && (k < n - 1)) {
        configFile = process.argv[k + 1];
        defaultConfigFile = false;
    }
    if ((process.argv[k] === '--inputFileName') && (k < n - 1)) {
        inputFileName = process.argv[k + 1];
    }
}

var logger = commonServer.logging.createLogger('server');

var server = new AppServer.Server(configFile);
server.startMaintenanceMode()
    .then(function () {
        var data = fs.readFileSync(inputFileName, 'utf8');
        var users = JSON.parse(data);
        var userService = registry.getModule('UserService');
        return userService.importUsers(users, importContext);
    })
    .then(function (results) {
        logger.info('user imported :', results);
    })
    .catch(function (error) {
        logger.error(error, 'Failed to import users');
        throw error;
    })
    .always(function () {
        server.appServer.shutdown();
    });
