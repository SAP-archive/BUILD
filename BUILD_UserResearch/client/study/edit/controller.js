'use strict';

var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function ($rootScope, $scope, $state, $stateParams, $location, $timeout, $window,
    currentStudy, Studies, HistoryService, uiError, urUtil) {
    var currentError;

    $scope.logHistory = function (title, _study) {
        var study = _study || currentStudy;

        HistoryService.log({
            project_id: study.projectId,
            title: title,
            user: 'user._id',
            resource_id: study._id + (!_study ? new Date() : ''),
            resource_version: 1,
            date: new Date(),
            resource_type: 'study',
            resource_name: title,
            resource_url: '/norman/projects/' + study.projectId + '/research/' +
                (_study ? 'edit/' : 'participant/') + study._id + '/',
            thumbnail_url: 'resources/norman-projects-client/assets/img/mail-screen.jpg',
            description: 'This is a Study for Project ' + study.projectId
        });
    };

    $scope.init = function () {
        currentStudy.projectId = $stateParams.currentProject;
        $scope.isEditStudy = true;
        $scope.study = currentStudy;
        $scope.study.showErrors = false;
        $scope.updateNameCount($scope.study.name, 45);
        $scope.updateDescCount();
        $scope.savedStudyName = false;

        if ($stateParams.snapshot) {
            // create from snapshot
            $scope.showEdit = true;
            $scope.showNameAndDescriptionPopup();

            currentStudy.snapshotId = $stateParams.snapshot._id;
            currentStudy.projectId = $stateParams.snapshot.projectId;
            currentStudy.thumbnail = $stateParams.snapshot.thumbnail;
        }
        else if ($scope.study._id === undefined) {
            // create from assets
            $scope.showEdit = true;
            $scope.showNameAndDescriptionPopup();
            currentStudy.questions = [];
        }
        else {
            // edit study
            $scope.showEdit = false;
        }

        $scope.$watch('study.name', function () {
            $scope.updateNameCount($scope.study.name, 45);
        });
    };


    /**
     * broadcasts popup-open event to open the popup at the edit icon
     */
    $scope.showNameAndDescriptionPopup = function () {
        $timeout(function () {
            $rootScope.$broadcast('popup-open', {
                id: 'study-name'
            });
            $timeout(function () {
                $scope.studyNameFocus = true;
            }, 100);
        });
    };

    // ensure the study has screens and those screens have questions
    $scope.canPublish = function (showError) {

        // first dismiss any existing error to start from a clean slate. We don't know if user has dismissed this already
        if (currentError) {
            uiError.dismiss(currentError.toastId);
            currentError = null;
        }
        if (!$scope.study) return false;
        if ($scope.study.questions.length !== 0) return true;

        var errMsg = 'Add at least one screen for the study';

        // when the user click on publish on an empty study, then add a screen I dismiss the error
        if (!showError && currentError && currentError.errMsg !== errMsg) {
            uiError.dismiss(currentError.toastId);
            currentError = null;
            $scope.study.showErrors = false;
        }

        if (showError && !currentError) {
            var toastId = uiError.create({
                content: errMsg,
                dismissOnTimeout: false,
                dismissButton: true
            });
            $scope.study.showErrors = true;
            currentError = {
                errMsg: errMsg,
                toastId: toastId
            };
        }
        return false;
    };

    $scope.publish = function () {
        if ($scope.canPublish(true)) $scope.$broadcast('dialog-open', 'publishPopup');
    };


    $scope.confirmedPublish = function () {
        $scope.logHistory('Study Published');
        $scope.study.status = 'published';
        $scope.update();

        $state.go('shell.project.UserResearch.published', {
            studyId: currentStudy._id
        });
    };

    $scope.animateEntry = !$stateParams.created;

    $scope.save = function () {
        $scope.savedStudyName = true;
        $rootScope.$broadcast('popup-close');

        if (_.isUndefined($scope.study.name) || _.isEmpty($scope.study.name.trim())) {
            $scope.study.name = 'My Untitled Study';
        }

        if (!_.isUndefined($scope.study._id)) {
            $scope.update();
        }
        else {
            Studies.save($scope.study, function (study) {
                $scope.logHistory('Study Created', study);
                $state.go('shell.project.UserResearch.edit.screens', {
                    studyId: study._id,
                    study: study,
                    created: true
                }, {
                    location: 'replace', // updates current url and history
                    inherit: true,
                    relative: $state.$current,
                    notify: true
                });
            });
        }
    };

    $scope.update = function () {
        $scope.study.$update();
    };

    $scope.delete = function () {
        $scope.study.$remove(function () {
            $state.go('shell.project.UserResearch.list');
        });
    };

    /**
     * Saves current study name and description so that
     * any changes can be undone on name dialog cancel
     */
    $scope.saveForUndo = function () {
        $scope.undoName = $scope.study.name;
        $scope.undoDesc = $scope.study.description;
    };

    /**
     * Function to handle when the user clicks 'Cancel' on the edit name and
     * description popover.  If this is a new study, then clicking cancel
     * will go back to the list of studies, and the study will not be saved.
     */
    $scope.onCancelEditName = function () {

        // To handle ESC presses we use onClose in popup
        // but a save will trigger onCancelEditName - so this
        // prevents removing save name
        if ($scope.savedStudyName) {
            $scope.savedStudyName = false;
            return;
        }

        $scope.study.name = $scope.undoName;
        $scope.study.description = $scope.undoDesc;

        if (!$scope.study._id) {
            $location.path('/norman/projects/' + $scope.study.projectId + '/research/');
        }
    };

    $scope.$on('image-uploaded', function () {
        $scope.imageUploaded = true;
    });

    $scope.openAssetsModal = function () {
        if ($scope.imageUploaded) $rootScope.$broadcast('refresh-assets');
        $scope.$broadcast('dialog-open', 'selectAssetsModal');
    };

    /**
     * Validate the study and the open the preview in new window/tab.
     */
    $scope.startPreview = function () {
        if ($scope.canPublish(true)) {
            var url = $state.href('shell.project.UserResearch.preview.list', {
                studyId: currentStudy._id
            });
            $window.open(url);
        }
    };

    $scope.updateNameCount = function (text, max) {
        var textCount = urUtil.textCountValidation(text, max);
        $scope.remainingNameCharacters = textCount.remaining;
        $scope.maxNameCharacters = textCount.max;
    };

    $scope.updateDescCount = function () {
        if ($scope.study.description) {
            var desc = $scope.study.description;
            var text = urUtil.textCountValidation(desc, 300);
            $scope.remainingDescCharacters = text.remaining;
            $scope.maxDescCharacters = text.max;

            if ($scope.limitString === true) {
                $scope.limitedString = urUtil.shortenText(comment, $scope.limitStringTo);
            }
        }
        else {
            $scope.remainingDescCharacters = 300;
        }
    };

    if (currentStudy.$promise) {
        currentStudy.$promise.then(function () {
            $scope.init();
        });
    }
    else {
        $scope.init();
    }

};
