'use strict';

// @ngInject
module.exports = function ($scope, ActiveProjectService, ProjectFactory, uiError) {

    $scope.projectLoaded = false;
    $scope.project = {
        _id: ActiveProjectService.id,
        archived: false
    };

    ProjectFactory.get({id: ActiveProjectService.id}).$promise
        .then(function (project) {
            $scope.project.archived = project.archived;
            $scope.projectLoaded = true;
        })
        .catch(function (res) {
            uiError.create({content: res.data.error, dismissOnTimeout: true});
        });

    /**
     * Returns the action the archive button should perform, either 'archive' or 'unarchive'
     */
    $scope.archiveActionName = function () {
        return $scope.project.archived ? 'unarchive' : 'archive';
    };

    /**
     * Changes a project's status to be archived
     */
    $scope.archiveProject = function () {
        $scope.enableArchiveButton = false;
        $scope.project.archived = !$scope.project.archived;

        ProjectFactory.archive($scope.project).$promise
            .catch(function (res) {
                uiError.create({content: res.data.error, dismissOnTimeout: false});
            });
    };
};
