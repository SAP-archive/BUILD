/*eslint no-process-exit: 0*/
'use strict';

var path = require('path');
var AppServer = require('node-sap-app-server');
var commonServer = require('norman-common-server');
var Promise = require('norman-promise');
var registry = commonServer.registry;
var INIT_TIMEOUT = 120;

var configFile = path.join(__dirname, 'config.json');

var argv = process.argv.slice(2);

var systemContext = {
    ip: '::1',
    user: {
        _id: '0',
        name: 'SYSTEM'
    }
};

function processEmails(operation) {
    var optout = registry.getModule('OptOutService'),
        callback = optout[operation].bind(optout),
        promises = [],
        i = 0;

    argv.shift();

    for (; i < argv.length; i++) {
        promises.push(callback(argv[i], systemContext));
    }

    Promise.waitAll(promises)
        .catch(function (err) {
            var j = 0;
            for (; j < err.detail.errors.length; j++) {
                if (err.detail.errors[j] !== undefined) {
                    console.err(err.detail.errors[j]);
                }
            }
        })
        .finally(function () {
            server.appServer.shutdown();
        });
}


function printUsage() {
    console.log('usage: node optout-script.js add|remove email1 email2 ... emailn');
}

if (argv.length < 2 || (argv[0] !== 'add' && argv[0] !== 'remove')) {
    printUsage();
    process.exit(1);
}

var config = commonServer.config.initialize(configFile);
if (config.server && config.server.workers) {
    // Ensure that we are not running in cluster mode
    delete config.server.workers;
}

var server = new AppServer.Server(config);
server.start().then(function () {
    var logger = commonServer.logging.createLogger('server');
    // Enforce server shutdown after timeout expiration
    setTimeout(function () {
        logger.error('Timeout.');
        server.appServer.shutdown();
    }, INIT_TIMEOUT * 1000);

    // argv[0] is either add or remove
    processEmails(argv[0]);
});
