/*eslint no-process-exit: 0*/
'use strict';

var path = require('path');
var AppServer = require('norman-app-server');
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var INIT_TIMEOUT = 120;

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
server.start().then(function() {
    // Enforce server shutdown after timeout expiration
    var cancelId = setTimeout(function() {
        var logger = commonServer.logging.createLogger('server');
        logger.error('Database initialization timeout, closing process.');
        cancelId = undefined;
        server.appServer.shutdown();
    }, INIT_TIMEOUT * 1000);

    //create initial data for UI Catalog manager
    var uicatalogMangerServer = registry.getModule('UICatalog');
    uicatalogMangerServer.initializeDb(function(err) {
        if (err) {
            console.log(err);
        }
        if (cancelId) {
            clearTimeout(cancelId);
            cancelId = undefined;
        }
        server.appServer.shutdown();
    });

    uicatalogMangerServer.initializeLibrary(function(err) {
        if (err) {
            console.log(err);
        }
        if (cancelId) {
            clearTimeout(cancelId);
            cancelId = undefined;
        }
        server.appServer.shutdown();
    });
});
