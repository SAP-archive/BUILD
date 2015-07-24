'use strict';
// @ngInject
module.exports = function($resource) {
    return $resource('/api/users/:id/:controller', {
        id: '@_id'
    }, {
        getUserById: {
            method: 'GET'
        }
    });
};
