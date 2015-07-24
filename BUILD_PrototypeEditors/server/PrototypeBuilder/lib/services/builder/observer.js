'use strict';

var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var serviceLogger = commonServer.logging.createLogger('prototypeBuilder-observer');

function PrototypeBuilderObserver(_SharedWorkspaceRegistry) {
    this.initialized = false;
    if (_SharedWorkspaceRegistry !== undefined) {
        serviceLogger.info('PrototypeBuilderObserver has been initialized with pre-existing service');
        this.initialized = true;
        this.SharedWorkspaceRegistry = _SharedWorkspaceRegistry;
    }
    this.PrototypeBuilderService = registry.getModule('PrototypeBuilder');
}

PrototypeBuilderObserver.prototype.onInitialized = function () {
    if (!this.initialized) {
        this.initialized = true;
        try {
            this.SharedWorkspaceRegistry = registry.getModule('SwRegistryService');
            this.SharedWorkspaceRegistry.registerModule('PrototypeBuilderObserver', 'post');
        }
        catch (error) {
            serviceLogger.error(error);
        }
    }
};

PrototypeBuilderObserver.prototype.postProcessData = function (response) {
    return this.PrototypeBuilderService.generatePrototypeArtifacts(response.prototype.projectId.toString());
};

module.exports = PrototypeBuilderObserver;
