'use strict';


var url = '/api/models/:id';

var paramDefaults = {
    // id : '@_id'
};

var actions = {
    create: {
        method: 'POST',
        url: url
    },
    getModels: {
        method: 'GET',
        url: url,
        isArray: true
    },
    update: {
        method: 'PUT'
    },
    importAll: {
        method: 'POST',
        url: '/api/models/:id/catalog/:catalogId'
    },
    importEntity: {
        method: 'POST',
        url: '/api/models/:id/catalog/:catalogId/catalogEntities/:catalogEntityId'
    }
};

var option = {};

function modelService($resource) {
    return $resource(url, paramDefaults, actions, option);
}

module.exports = ['$resource', modelService];
