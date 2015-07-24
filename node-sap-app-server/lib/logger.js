'use strict';

var logging = require('./logging.js');

// Server module shared logger
var logger = logging.createLogger('server');
logging.addWatch(logger);

module.exports = logger;

// Register uncaughtException handler
process.on('uncaughtException', function (err) {
    var now = new Date();

    try {
        logger.fatal(err, 'Uncaught exception, closing process');
    }
    catch (error) {
        console.error(error); // eslint-disable-line no-console
    }

    console.error(now.toISOString(), ' [FATAL] uncaught exception: ' + err.message + '\n' + err.stack); // eslint-disable-line no-console
    setTimeout(function () {
        process.exit(1); // eslint-disable-line no-process-exit
    }, 1000);
});
