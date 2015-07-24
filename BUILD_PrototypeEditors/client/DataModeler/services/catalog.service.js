'use strict';

function catalogService($resource) {
    var oDataUrl = '/api/catalogs', defaultParams = {};

    var actions = {
        search: {
            method: 'post',
            url: oDataUrl + '/entities/search',
            isArray: true
        },
        searchStrict: {
            method: 'post',
            url: oDataUrl + '/entities/search',
            isArray: true
        }
    };

    return $resource(oDataUrl, defaultParams, actions);
}

module.exports = ['$resource', catalogService];
