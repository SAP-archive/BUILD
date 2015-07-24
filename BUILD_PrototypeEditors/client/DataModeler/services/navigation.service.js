'use strict';


var url = '/api/models/:modelId/entities/:entityId/navigationProperties/:id';

var paramDefaults = {
    id: '@_id'
};

var actions = {
    update: {method: 'PUT'}
};

var option = {};

function navigationService($resource) {
    return $resource(url, paramDefaults, actions, option);
}

module.exports = ['$resource', navigationService];
