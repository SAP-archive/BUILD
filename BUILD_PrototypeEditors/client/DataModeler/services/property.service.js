'use strict';

var url = '/api/models/:modelId/entities/:entityId/properties/:id';

var paramDefaults = {
    id: '@_id'
};

var actions = {
    update: {method: 'PUT'},
    queryType: {
        method: 'GET',
        url: 'api/models/0/entities/0/properties/types',
        isArray: true
    }
};

var option = {};

function propertyService($resource) {
    return $resource(url, paramDefaults, actions, option);
}

module.exports = ['$resource', propertyService];
