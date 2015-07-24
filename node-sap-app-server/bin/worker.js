'use strict';

var utils = require('../lib/utils.js');
var serverLogger = require('../lib/logger.js');
var MESSAGE_TYPE = require('../lib/constants.js').MESSAGE_TYPE;
var common = require('node-sap-common');
var registry = common.registry;
var logging = registry.getModule('logging');
var Server = require('../lib/server.js');

var DEBUG_PORT = 5858;

var wid = utils.setupWorker(DEBUG_PORT);
process.title = 'worker #' + wid;
logging.Logger.systemFields.appServer = process.title;

var appServer;

function start(message) {
    serverLogger.info('Starting worker #' + wid);
    var config = message.config;
    config.wid = wid;
    var server = new Server(config);
    return server.start()
        .then(function () {
            appServer = server.appServer;
        });
}

function shutdown() {
    serverLogger.info('Stopping worker #' + wid);
    return appServer.shutdown();
}

process.on('message', function (message) {
    if (typeof message === 'object' && typeof message.type === 'string') {
        switch (message.type) {
            case MESSAGE_TYPE.start:
                start(message)
                    .then(function () {
                        process.send({type: MESSAGE_TYPE.started, wid: wid});
                    })
                    .catch(function (error) {
                        serverLogger.error(error);
                        process.send({type: MESSAGE_TYPE.startFailed, wid: wid });
                    });
                break;
            case MESSAGE_TYPE.stop:
                shutdown();
                break;
            default :
                serverLogger.warn('Received unsupported message of type ' + message.type);
                break;
        }
    }
});

