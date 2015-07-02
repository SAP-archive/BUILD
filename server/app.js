/*eslint no-process-exit: 0*/
'use strict';

var path = require('path');
var AppServer = require('node-sap-app-server');
var configFile = path.join(__dirname, 'config.json');

var k, n;
for (k = 2, n = process.argv.length; k < n; ++k) {
    if ((process.argv[k] === '--config') && (k < n - 1)) {
        configFile = process.argv[k + 1];
    }
    if (process.argv[k] === '--create-admin') {
        console.warn('Deprecated create-admin. Use the createAdmin script on admin app.');
        process.exit(1);
    }
    if (process.argv[k] === '--unassign-admin') {
        console.warn('Deprecated unassign admin. Use the createAdmin script on admin app.');
        process.exit(1);
    }
        }

var server = new AppServer.Server(configFile);
server.start();
