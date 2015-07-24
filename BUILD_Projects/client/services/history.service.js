'use strict';

// @ngInject
module.exports = function ($resource) {
    return $resource('/api/projects/:project_id/history', {
            project_id: '@project_id'
        },
        {
            getHistory: {method: 'GET', isArray: true},
            log: {method: 'POST'}
        });
};
