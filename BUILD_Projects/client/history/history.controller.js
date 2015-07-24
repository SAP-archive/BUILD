'use strict';

// @ngInject
module.exports = function ($scope, HistoryService, ActiveProjectService, uiError) {
    HistoryService.getHistory({project_id: ActiveProjectService.id}).$promise
        .then(function (events) {
            $scope.events = events;
        })
        .catch(function (res) {
            uiError.create({
                content: res.data.error,
                dismissOnTimeout: false
            });
        });
};
