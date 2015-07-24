'use strict';

var path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = 'config.json';

console.log('Starting in mode: ' + process.env.NODE_ENV);

var configFile = path.join(__dirname, config);
var appServer = require('node-sap-app-server');

var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === "--config") && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
}

appServer.Server.start(configFile).then(function(){
    //console.log('UI Catalog Manager server is ready...')
});