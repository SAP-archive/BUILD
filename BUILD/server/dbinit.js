/*eslint no-process-exit: 0*/
'use strict';

console.log('!!! Deprecated !!!');
console.log('Use initSchema instead');

var path = require('path');
var AppServer = require('node-sap-app-server');
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var INIT_TIMEOUT = 120;
var Promise = require('norman-promise');

var configFile = path.join(__dirname, 'config.json');

var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === '--config') && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
}

var config = commonServer.config.initialize(configFile);
if (config.server && config.server.workers) {
    // Ensure that we are not running in cluster mode
    delete config.server.workers;
}

var server = new AppServer.Server(config);
server.start()
    .then(function () {
        var initPromises = [];
        var uiCatalog = registry.getModule('UICatalog');
        initPromises.push(Promise.objectInvoke(uiCatalog, 'initializeDb'));
        initPromises.push(Promise.objectInvoke(uiCatalog, 'initializeLibrary'));
        initPromises.push(Promise.objectInvoke(uiCatalog, 'storeOpenUI5Canvas'));
        return Promise.waitAll(initPromises);
    })
    .setTimeout(INIT_TIMEOUT * 1000, function () {
        var logger = commonServer.logging.createLogger('server');
        logger.error('Database initialization timeout, closing process.');
        throw new Error("Timeout expired");
    })
    .always(function () {
        server.appServer.shutdown();
    });
