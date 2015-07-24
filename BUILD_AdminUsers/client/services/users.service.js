'use strict';

var baseUrl = '/api/admin/users/', defaultParams = {}, option = {};

var actions = {
    getUsers: {
        method: 'GET',
        url: baseUrl
    },
    deleteUser: {
        method: 'DELETE',
        url: baseUrl + ':id'
    },
    setRole: {
        method: 'POST',
        url: baseUrl + 'role'
    }
};

function userService($resource) {
    return $resource(baseUrl, defaultParams, actions, option);
}

module.exports = ['$resource', userService];
