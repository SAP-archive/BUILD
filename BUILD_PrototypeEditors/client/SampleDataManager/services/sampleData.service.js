'use strict';
var oDataUrl = '/api/sampledata/',
    defaultParams = {};

var actions = {
    getEntityNavDataForProj: {
        method: 'GET',
        url: oDataUrl + ':projId/:entityName',
        params: {
            projId: '@projId',
            entityName: '@entityName'
        },
        isArray: false
    },
    saveSampleData: {
        method: 'PUT',
        url: oDataUrl + ':projId',
        params: {
            projId: '@projId'
        },
        isArray: false
    }
};

var option = {};


function sampleDataService($resource) {
    return $resource(oDataUrl, defaultParams, actions, option);
}

module.exports = ['$resource', sampleDataService];
