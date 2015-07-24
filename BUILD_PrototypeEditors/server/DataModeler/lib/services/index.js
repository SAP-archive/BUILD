'use strict';

var registry = require('norman-common-server').registry;
var Model = require('./model');
var ModelObserver = require('./model/modelObserver.js');
var constant = require('./common/constant.js');

registry.registerModule(new Model(), constant.MODEL_SERVICE);
registry.registerModule(new ModelObserver(), constant.MODEL_OBSERVER);

module.exports = {
    initialize: function (done) {
        var service = registry.getModule(constant.MODEL_SERVICE);

        service.initialize(done);
    },
    onInitialized: function () {
        var service = registry.getModule(constant.MODEL_SERVICE);

        service.onInitialized();

        service = registry.getModule(constant.MODEL_OBSERVER);

        service.onInitialized();
    },
    checkSchema: function (done) {
        var service = registry.getModule(constant.MODEL_SERVICE);
        service.checkSchema(done);
    },
    shutdown: function (done) {
        var service = registry.getModule(constant.MODEL_SERVICE);
        registry.unregisterModule(constant.MODEL_SERVICE);
        service.shutdown(done);
    }
};
