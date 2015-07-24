'use strict';

// @ngInject
module.exports = function ($resource, $stateParams) {
    return $resource('/api/projects/:projectId/studies/:id/review', {
        id: $stateParams.studyId,
        projectId: $stateParams.currentProject // cannot use $stateParams due to an issue: https://github.com/angular-ui/ui-router/issues/136
    }, {
        query: {
            method: 'GET',
            isArray: false
        },
        getQuestionStats: {
            url: '/api/projects/:projectId/studies/:id/review/:questionId',
            params: {
                projectId: '@projectId',
                id: '@id',
                questionId: '@questionId'
            },
            method: 'GET',
            isArray: false
        }
    });
};
