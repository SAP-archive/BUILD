'use strict';


var url = '/api/models/:modelId/entities/:id';

var paramDefaults = {
    id: '@_id'
};

var actions = {
    update: {method: 'PUT'}
};

var option = {};

function entityService($resource) {
    return $resource(url, paramDefaults, actions, option);
}

module.exports = ['$resource', entityService];
