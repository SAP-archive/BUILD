'use strict';

var singleton = require('norman-server-tp')['node-sap-common'].singleton;
var hexadecimal = /^[0-9a-fA-F]+$/;
var logging = require('../logging');
var serviceLogger = logging.createLogger('feature-service');
var globalConfig = require('../config');

/**
 * @private
 */
var _isEmpty = function (obj) {
    // null and undefined are 'empty'
    if (obj == null) {
        return true;
    }

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)
    {
        return false;
    }
    if (obj.length === 0)  {
        return true;
    }

    // Otherwise, does it have any properties of its own?
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
            return false;
        }
    }

    return true;
};

function Features() {
    serviceLogger.info({}, '>> Features() created');
    this.isInit = false;
    this.featureList = {};

    var self = this;
    // Listen for changes to the global config, this will refresh the list each time something is added to it
    globalConfig.on('configure', function () {
        self.initialize();
    });

    if(globalConfig.get('features')){
        this.initialize();
    }
}

/**
 * Config loaded from the global config, this is normally read from the service.json file defined in Norman and sample app
 *
 * @returns {exports}
 */
Features.prototype.initialize = function () {
    serviceLogger.info('>> initialize()');

    var toggleConfigFile = globalConfig.get('features');

    if (_isEmpty(toggleConfigFile)) {
        serviceLogger.warn('initialize(), feature list was not found, nothing updated');
        toggleConfigFile = {};
    }

    this.featureList = toggleConfigFile;
    this.isInit = true;
    serviceLogger.info('<< initialize(), finished');
};

Features.prototype.isLoaded = function () {
   return this.isInit;
};

/**
 * Return the features feature list
 *
 * @returns {*}
 */
Features.prototype.getFeatureList = function () {
    serviceLogger.info({
    }, '>> getFeatureList()');

    serviceLogger.info('<< getFeatureList(), returning feature list');
    return this.featureList;
};

/**
 * Determine if feature is enabled
 *
 * @param featureName {string}
 * @returns {*}
 */
Features.prototype.isEnabled = function (featureName) {
    serviceLogger.info({
        featureName: featureName
    }, '>> isEnabled()');

    var self = this;

    // Validation steps
    if (typeof featureName !== 'string') {
        throw new TypeError('Feature name is not a string');
    }

    // Enabled by default i.e. if service is not handled in config, then assume its available
    var isEnabled = false;
    Object.keys(this.featureList).forEach(function (key) {
        if (key.toLowerCase() === featureName.toLowerCase()) {
            isEnabled = self.featureList[key].enabled;
        }
    });

    serviceLogger.info('<< isEnabled(), returning ' + isEnabled);
    return isEnabled;
};

module.exports = singleton.declare('toggle', Features);
