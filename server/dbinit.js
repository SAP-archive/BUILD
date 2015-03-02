/*eslint no-process-exit: 0*/
'use strict';

var path = require('path');
var Server = require('norman-app-server').Server;
var configFile = path.join(__dirname, 'dbinitconfig.json');

var k, n, admin = null,
    cmd;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === '--config') && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
}

Server.start(configFile).then(function() {

  //create initial data for UI Catalog manager
    var uicatalogMangerServer = require('norman-ui-catalog-manager-server');
    uicatalogMangerServer.initializeDb();
});
