/*eslint no-process-exit: 0*/
'use strict';

var path = require('path');
var AppServer = require('node-sap-app-server');
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var serverLogger = commonServer.logging.createLogger('set-default-access');

var configFile = path.join(__dirname, 'config.json');
var systemContext = {
    ip: '::1',
    user: {
        _id: '0',
        name: 'SYSTEM'
    }
};
var access = {
    _id: '*',
    scope: [
        {
            name: 'access',
            permissions: ['standard']
        },
        {
            name: 'study',
            permissions: ['participant']
        },
        {
            name: 'project',
            permissions: ['collaborator']
        }
    ]
};

var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === '--config') && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
}

var server = new AppServer.Server(configFile);
server.startMaintenanceMode()
    .then(function () {
        var accessService = registry.getModule('AccessService');
        return accessService.set(access, systemContext);
    })
    .catch(function (error) {
        serverLogger.error(error, 'Failed to update default access rule');
        throw error;
    })
    .always(function () {
        server.appServer.shutdown();
    });
