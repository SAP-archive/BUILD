'use strict';

// @ngInject
module.exports = function ($resource, $stateParams) {
    return $resource('/api/participant/studies/:studyId/tracking/', {
        studyId: function () {
            return $stateParams.studyId;
        }
    });
};
