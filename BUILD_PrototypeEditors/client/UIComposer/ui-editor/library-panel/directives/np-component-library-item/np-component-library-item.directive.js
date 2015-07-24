'use strict';
var _ = require('norman-client-tp').lodash;

var npComponentLibraryItem = ['$document', '$log', 'npDragHelper', 'npImageHelper',
    function ($document, $log, npDragHelper, npImageHelper) {
        return {
            templateUrl: 'resources/norman-prototype-editors-client/UIComposer/ui-editor/library-panel/directives/np-component-library-item/np-component-library-item.html',
            restrict: 'E',
            scope: {
                displayName: '@',
                iconSrc: '@',
                type: '@'
            },
            link: function (scope, element, attrs) {
                var documentBody = angular.element($document[0].body),
                    supportedTypes = ['asset', 'control', 'binding'],
                    dragData;

                try {
                    // eval supports jsons with single quote
                    dragData = scope.$eval(attrs.dragData);
                }
                catch (err) {
                    $log.error('Error parsing drag data: ', err);
                }

                var onDragstart = function () {
                    if (scope.type === 'asset') {
                        npImageHelper.getHotspotImageData(dragData.assetSrc)
                            .then(function (imageData) {
                                npDragHelper.startDrag(imageData, true);
                            });
                    }
                    else {
                        npDragHelper.startDrag(dragData);
                    }
                    documentBody.on('dragover', onOver);
                    return true;
                };

                var onDragend = function () {
                    documentBody.off('dragover', onOver);
                    npDragHelper.endDrag();
                };

                var onOver = function () {
                };

                if (!_.isEmpty(dragData) && _.contains(supportedTypes, scope.type)) {
                    element.on('dragstart', onDragstart);
                    element.on('dragend', onDragend);
                }
                else {
                    $log.warn('not supported library item type', scope.type, dragData);
                }
            }
        };
    }
];

module.exports = npComponentLibraryItem;
