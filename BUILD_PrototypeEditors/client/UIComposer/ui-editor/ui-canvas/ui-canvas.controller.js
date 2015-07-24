'use strict';

var _ = require('norman-client-tp').lodash;

module.exports = ['$window', '$scope', '$q', '$log', '$stateParams', 'npUiCanvasAPI', 'npGrid', 'npImageHelper', 'npSnapGuide', 'npPrototype', 'npCanvasElementHighlight',
    'npCanvasElementDrop', 'npPageMetadata', 'npMessaging', 'npCanvasUpdater', 'npPageMetadataEvents', 'resPrototype',
    function ($window, $scope, $q, $log, $stateParams, npUiCanvasAPI, npGrid, npImageHelper, npSnapGuide, npPrototype, npCanvasElementHighlight, npCanvasElementDrop,
              npPageMetadata, npMessaging, npCanvasUpdater, pageMdEvents, resPrototype) {
        var that = this;

        npGrid.init();
        that.gridElements = npGrid.getElementsFlattened();
        that.horizontalGuides = npSnapGuide.getHorizontalGuides();
        that.verticalGuides = npSnapGuide.getVerticalGuides();
        that.elementHighlights = npCanvasElementHighlight.getElementHighlights();
        that.canvasUrl = npPrototype.getPrototypeMainUrl();

        // TODO why do we need this?
        npMessaging.showBusyIndicator();

        if (!resPrototype.isSmartApp) {
            npCanvasUpdater.startListeningForMetadataChanges();
        }

        var canvasReady = npUiCanvasAPI.initReady();
        canvasReady
            .then(function () {
                $log.log('canvas ready');
            })
            .catch(function () {
                $log.log('canvas error');
            });

        var navTo = function (pageName) {
            var pageMd;
            $q.all([npPageMetadata.getPageMetadata(pageName), canvasReady])
                .then(function (values) {
                    pageMd = values[0];
                    $scope.$emit('uiCanvas/navigationStart', pageMd);
                    npMessaging.showBusyIndicator();
                    return npUiCanvasAPI.navTo(pageMd);
                })
                .then(function () {
                    $scope.$emit('uiCanvas/navigationDone', pageMd);
                    npMessaging.hideBusyIndicator();
                    $window.focus();
                });
        };
        navTo($stateParams.currentScreen);

        var onPageChange = function (event, newPageName) {
            if (newPageName) {
                navTo(newPageName);
            }
        };

        var pageChangeListener = pageMdEvents.listen(pageMdEvents.events.pageChanged, onPageChange);

        that.onSuccessImageDrop = function (response) {
            var assetId = response[0]._id,
                assetSrc = npPrototype.getAssetUrl(assetId);
            npImageHelper.getHotspotImageData(assetSrc).then(function (imgData) {
                var imgWidth = _.parseInt(_.result(_.find(imgData.properties, {
                        name: 'width'
                    }), 'value')),
                    imgHeight = _.parseInt(_.result(_.find(imgData.properties, {
                        name: 'height'
                    }), 'value'));
                var positionData = {
                    x: Math.max(that.imageX - (imgWidth / 2), 0),
                    y: Math.max(that.imageY - (imgHeight / 2), 0)
                };
                var targetMd = npGrid.getRootElement().controlMd;
                npCanvasElementDrop.dropAtTarget(imgData, targetMd, positionData);
            });
            // this goes to editor, and editor notifies the library panel
            // better performance than using rootScope
            $scope.$emit('requestLibraryRefresh');
        };

        that.handleFileUploadError = function (response) {
            npMessaging.showError('Error: failed to upload the image', response);
        };


        $scope.$on('elementHighlight/updated', function refreshElementHighlight() {
            $scope.$evalAsync(function () {
                that.elementHighlights = npCanvasElementHighlight.getElementHighlights();
            });
        });

        $scope.$on('snapGuides/updated', function refreshSnapGuides() {
            // TODO: See why the $digest is needed in this case.
            that.horizontalGuides = npSnapGuide.getHorizontalGuides();
            that.verticalGuides = npSnapGuide.getVerticalGuides();
            $scope.$digest(); // AA: digest is necessary here, not sure why...
        });

        $scope.$on('imagePositionCoordinates', function (event, x, y) {
            that.imageX = x;
            that.imageY = y;
        });

        $scope.$on('$destroy', function () {
            // save any pending change
            npPageMetadata.flushUpdates();
            // invalidate the canvas
            npUiCanvasAPI.invalidate();

            npCanvasUpdater.stopListeningForMetadataChanges();

            pageChangeListener();
        });
    }
];
