'use strict';

// @ngInject
module.exports = function ($resource, $stateParams) {
    return $resource('/api/projects/:projectId/prototype/snapshot', {
        projectId: function () {
            return $stateParams.currentProject;
        }
    });

};
