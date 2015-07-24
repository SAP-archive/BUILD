'use strict';

// @ngInject
module.exports = function ($scope, currentStudy, Studies, uiError) {

    $scope.updateSelectedItem = function (selectedItem) {
        $scope.selectedItem = selectedItem;
        if ($scope.selectedItem === 'archive') {
            angular.element(document.getElementById('study-settings-archive-restart')).attr('red', '');
        }
        else {
            angular.element(document.getElementById('study-settings-archive-restart')).removeAttr('red');
        }
    };

    $scope.updateStatus = function (sStatus) {

        if ($scope.selectedItem === 'restart') {
            $scope.study.status = 'published';
        }
        else if ($scope.selectedItem === 'archive') {
            $scope.study.status = 'archived';
        }
        else {
            $scope.study.status = sStatus;
        }

        Studies.update($scope.study).$promise
            .then(function success(study) {
                $scope.study = study;
                $scope.init(study);
            })
            .catch(function error(response) {
                uiError.create({
                    content: response.data.error,
                    dismissOnTimeout: true
                });
            });
    };

    $scope.init = function (result) {
        $scope.isStudyPublished = result.status === 'published' ? true : false;
        $scope.isStudyPaused = result.status === 'paused' ? true : false;
        $scope.isStudyArchived = result.status === 'archived' ? true : false;
        $scope.selectedItem = null;
    };

    if (currentStudy.$promise) {
        currentStudy.$promise.then(function () {
            $scope.study = currentStudy;
            $scope.init(currentStudy);
        });
    }
    else {
        $scope.study = currentStudy;
        $scope.init(currentStudy);
    }

};
