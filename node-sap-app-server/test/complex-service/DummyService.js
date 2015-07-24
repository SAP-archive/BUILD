'use strict';
var logger = require('../logger.js');

var callbacks = [ 'initialize', 'onInitialized', 'checkSchema', 'onSchemaChecked', 'initializeSchema',
    'onSchemaInitialized', 'prepareSchemaUpgrade', 'upgradeSchema', 'onSchemaUpgraded' ];

function DummyService(name, syncCallbacks) {
    var self = this;
    var callbackCount = {};
    this.name = name;
    callbacks.forEach(function (cbName) {
        callbackCount[cbName] = 0;
        if (syncCallbacks) {
            self[cbName] = function () {
                logger.debug(cbName + ' called on service ' + this.name);
                this.callbackCount[cbName]++;
            };
        }
        else {
            self[cbName] = function (done) {
                logger.debug(cbName + ' called on service ' + this.name);
                this.callbackCount[cbName]++;
                setTimeout(done, 0);
            };
        }
    });
    this.callbackCount = callbackCount;
}
module.exports = DummyService;

