'use strict';

var registry = require('norman-common-server').registry;
var Promise = require('norman-promise');
var businessCatalog = {};
var sampleDataService = {
    create: function () {
        return new Promise(function (resolve) {
            resolve('OK');
        });
    }
};
var assetService = {
    getAssetWithContent: function (assetId) {
        return new Promise(function (resolve) {

            resolve({
                filename: 'assets/' + assetId,
                contentType: 'image/png',
                fileContent: new Buffer('')
            });

        });
    }
};
var pageFlowService = {

};

registry.registerModule(businessCatalog, 'BusinessCatalog');
registry.registerModule(sampleDataService, 'SampleDataService');
registry.registerModule(assetService, 'AssetService');
registry.registerModule(pageFlowService, 'PageFlow');

module.exports = {
    initialize: function () {

    },
    shutdown: function () {

    },
    getHandlers: function () {
        return {};
    }
};
