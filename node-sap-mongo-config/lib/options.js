'use strict';
var logging = require('node-sap-logging');

var defaultLogger = new logging.Logger('system.config');
defaultLogger.addAppender({
    level: logging.LogLevel.DEBUG,
    output: new logging.output.Console()
});

module.exports = {
    configCollection: 'config',
    secureConfigCollection: 'secure-config',
    logger: defaultLogger
};
