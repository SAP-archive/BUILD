/*eslint global-strict:0 */
'use strict';

var oDataUrl = '/api/catalogs/', defaultParams = {};

var actions = {
    getCatalogs: {
        method: 'GET',
        url: oDataUrl,
        isArray: true
    },
    'import': {
        method: 'POST',
        url: oDataUrl + 'import'
    }
};

var option = {};

function catalogService($resource) {
    return $resource(oDataUrl, defaultParams, actions, option);
}

module.exports = ['$resource', catalogService];

