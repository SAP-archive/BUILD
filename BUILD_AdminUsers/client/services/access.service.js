'use strict';

var baseUrl = '/api/admin/access/', defaultParams = {}, option = {};

var actions = {
    getSecurityPolicies: {
        method: 'GET',
        url: baseUrl
    },
    deleteSecurityPolicy: {
        method: 'DELETE',
        url: baseUrl + ':domain'
    },
    setSecurityPolicy: {
        method: 'POST',
        url: baseUrl + 'securityPolicy'
    }
};

function accessService($resource) {
    return $resource(baseUrl, defaultParams, actions, option);
}

module.exports = ['$resource', accessService];
