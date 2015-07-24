'use strict';

var url = '/api/models/:modelId/entities/:entityId/groups/:id';

var paramDefaults = {
    id: '@_id'
};

var actions = {
    update: {method: 'PUT'}
};

var option = {};

function groupService($resource) {
    return $resource(url, paramDefaults, actions, option);
}

module.exports = ['$resource', groupService];
