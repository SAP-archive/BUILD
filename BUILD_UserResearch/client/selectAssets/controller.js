/*eslint no-cond-assign: 0 */
'use strict';
var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function ($scope, $rootScope, $stateParams, Assets, uiError, urUtil) {

    $scope.projectId = $stateParams.currentProject;
    $scope.selected = [];
    $scope.assetsUploadingList = [];

    /**
     * Restrict assets to the following: 'image/png|image/jpg|image/gif|image/jpeg|image/bmp'
     * Note: svg images are not currently supported
     */
    $scope.loadAssets = function () {
        Assets
            .query({
                projectId: $scope.projectId,
                thumbOnly: false,
                fileType: 'image/png|image/jpg|image/gif|image/jpeg|image/bmp'
            })
            .$promise
            .then(function (assets) {
                // reverse so we get last added at the top
                $scope.assets = assets.reverse();
            });
    };

    $scope.selectAsset = function (index) {
        var asset = $scope.assets[index];
        if (asset.selected) {
            asset.selected = false;
            $scope.selected.splice($scope.selected.indexOf(asset), 1);
        }
        else {
            asset.selected = true;
            $scope.selected.push(asset);
        }
    };

    /**
     * Create a new question from the selected image
     * Dev-Note: when a question is created this way, the ordinal value will come into play as it will be used
     * to group questions.
     */
    $scope.create = function () {
        if ($scope.selected.length) {
            var questionList = $scope.selected.map(function (image) {
                var url = '/api/projects/' + $scope.projectId + '/document/' + image._id + '/' +
                    image.metadata.version + '/render';
                var thumbnailUrl = url.concat(image.metadata.hasThumb ? '/?thumbOnly=true' : '');
                return {
                    url: url,
                    name: image.filename,
                    thumbnail: thumbnailUrl,
                    interactive: false,
                    documentId: image._id,
                    documentVersion: image.metadata.version,
                    setOrdinal: true
                };
            });
            $scope.addQuestions(questionList);
        }

        // we reset what was selected so that we don't continually add questions
        $scope.selected = [];
    };

    // callback used to add an asset to the list to be added when the upload completed
    $scope.addAfterUpload = function (responseDetails, sequence) {
        responseDetails[0].sequence = sequence;
        $scope.assetsUploadingList.push(responseDetails[0]);
        return true;
    };

    /**
     * Update the assets dialog after all assets have been uploaded.
     */
    $scope.updateAllAssets = function () {
        if ($scope.assetsUploadingList.length > 0) {
            $scope.assets = _.sortBy($scope.assetsUploadingList, 'sequence').concat($scope.assets);
            // Clear the uploading list as we will reload with the saved list.
            urUtil.clearFileUploadProgress($scope, $scope.assetsUploadingList);
            $scope.assetsUploadingList = [];
        }
    };

    $scope.rejectFiles = function (/*res*/) {
        uiError.create({
            content: 'This is not a valid image file. Please try again.',
            dismissOnTimeout: false,
            dismissButton: true
        });
    };

    $rootScope.$on('refresh-assets', $scope.loadAssets);

    $scope.$on('dialog-open', function (event, id) {
        if (id === 'selectAssetsModal') {
            $scope.loadAssets();
        }
    });

    // Reset selected on each asset when either loaded first or on subsequent modal calls
    $scope.init = function () {
        angular.forEach($scope.assets, function (asset) {
            asset.selected = false;
        });
        $scope.selected = [];
    };

    $scope.onDialogCancel = function () {
        $scope.init();
    };

    $scope.isDisabled = function () {
        return !($scope.selected.length > 0);
    };

    $scope.init();
};
