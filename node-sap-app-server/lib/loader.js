'use strict';
var logger = require('./logger');

module.exports.require = function (moduleName) {
    var modExports;
    logger.debug('Loading module ' + moduleName);
    try {
        modExports = require(moduleName);
    }
    catch(err) {
        logger.error(err, 'Failed to load module ' + moduleName);
        throw err;
    }
    return modExports;
};
