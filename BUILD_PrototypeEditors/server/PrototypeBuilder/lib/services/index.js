'use strict';

var registry = require('norman-common-server').registry;
var PrototypeBuilderService = require('./builder');
var prototypeBuilderServiceInstance = new PrototypeBuilderService();
registry.registerModule(prototypeBuilderServiceInstance, 'PrototypeBuilder');


var PrototypeBuilderObserver = require('./builder/observer');
var prototypeBuilderObserverInstance = new PrototypeBuilderObserver();
registry.registerModule(prototypeBuilderObserverInstance, 'PrototypeBuilderObserver');

module.exports = {
    initialize: function (done) {
        prototypeBuilderServiceInstance.initialize(done);
    },
    onInitialized: function () {
        prototypeBuilderServiceInstance.onInitialized();
        prototypeBuilderObserverInstance.onInitialized();
    }
    // FIXME Shutdown is not yet called by the AppServer so ignore it for now
    // shutdown: function () {
    //    registry.unregisterModule('PrototypeBuilder');
    // }
};
