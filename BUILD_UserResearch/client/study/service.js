'use strict';

// @ngInject
module.exports = function ($resource) {
    return $resource('/api/projects/:projectId/studies/:id', {
        id: '@_id',
        projectId: '@projectId' // cannot use $stateParams due to an issue: https://github.com/angular-ui/ui-router/issues/136
    }, {
        update: {
            method: 'PUT',
            transformRequest: function (data) {
                return angular.toJson({
                    name: data.name,
                    description: data.description,
                    status: data.status
                });
            }
        },
        sendInvitee: {
            method: 'POST',
            params: {
                id: '@_id',
                projectId: '@projectId'
            },
             url: '/api/projects/:projectId/studies/:id/sendInvitee'
        },
        createStudyWithQuestion: {
            method: 'POST',
            params: {
                projectId: '@projectId'
            },
            url: '/api/projects/:projectId/studies/create'
        }
    });
};
