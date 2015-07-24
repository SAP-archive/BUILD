'use strict';

var oDataUrl = '/api/uicatalogs/',
    defaultParams = {};

var actions = {
    'uploadTemplate': {
        method: 'POST',
        url: oDataUrl + 'catalogupload'
    },
    'getCatalogList': {
        method: 'GET',
        url: oDataUrl + 'getSampleTemplates',
        isArray: true
    },
    'getCatalog': {
        method: 'GET',
        url: oDataUrl + 'catalog/name/:name/catalogversion/:catalogVersion',
        params: {
            name: '@name',
            catalogVersion: '@catalogVersion'
        }
    },
    'getAvailableVersions':{
      method:'GET',
      url:oDataUrl+'/libtype/:libType/getuilibversions',
        params: {
            libType: '@libType'
        },
        isArray:true
    },
    'updateCatalog': {
        method: 'POST',
        url: oDataUrl + 'updateCustomCatalog'
    },
    'downloadCatalog': {
        method: 'GET',
        url: oDataUrl + 'downloadcatalog/libtype/:type',
        params: {
            type: '@type'
        }
    },
    'downloadCatalogs': {
        method: 'GET',
        url: oDataUrl + 'downloadcatalogs/catalogInfo/:catalogInfo',
        params: {
            cataloginfo: '@catalogInfo'
        },
        isArray: true
    },
    'deleteControls': {
        method: 'POST',
        url: oDataUrl + 'deletecontrols'
    },
    'deleteCatalogs': {
        method: 'DELETE',
        url: oDataUrl + 'deletecatalogs/catalogInfo/:catalogInfo',
        params: {
            cataloginfo: '@catalogInfo'
        }
    },
    'activateCatalog': {
        method: 'GET',
        url: oDataUrl + 'catalog/name/:name/catalogversion/:catalogVersion/libType/:libType/activate',
        params: {
            name: '@name',
            catalogVersion: '@catalogVersion',
            libType: '@libType'
        }
    }
};

var option = {};

function uicatalogService($resource) {
    return $resource(oDataUrl, defaultParams, actions, option);
}

module.exports = ['$resource', uicatalogService];
