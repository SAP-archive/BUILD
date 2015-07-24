'use strict';
var _ = require('norman-client-tp').lodash;

var npAsset = ['$resource', '$q', function ($resource, $q) {
    var oProjectsUrl = 'api/projects/',
        defaultParams = {};

    var assetActions = {
        getAssets: {
            method: 'GET',
            url: oProjectsUrl + ':projectId/document',
            isArray: true,
            params: {
                projectId: '@projectId'
            }
        }
    };
    var option = {};

    var getAssetsService = function () {
        return $resource(oProjectsUrl, defaultParams, assetActions, option);
    };

    /**
     * @name getAssetsLibrary
     * @description Retrieve all loaded images
     * @param {string} projectId Id of the project for which images need to be returned
     * @returns {Promise} Returns a promise resolved an array of all images
     */
    var getAssetsLibrary = function (projectId) {
        var defer = $q.defer();
        getAssetsService().getAssets(projectId, function (assetLibrary) {
            if (!assetLibrary) {
                defer.reject('list empty');
            }
            else {
                var assets = _.map(assetLibrary, function (elem) {
                    return {
                        title: elem.filename,
                        assetId: elem._id
                    };
                });
                defer.resolve(assets);
            }
        });
        return defer.promise;
    };

    return {
        getAssetsLibrary: getAssetsLibrary
    };
}];
module.exports = npAsset;
