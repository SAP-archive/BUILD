'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiZoom
 *
 * @description
 * Creates a label containing a zoom value. Clicking it will open a popup containing a slider element and
 * buttons to easily modify the zoom value of a view.
 *
 * @restrict E
 * @element ANY
 *
 * @param {number} min the minimum value of the zoom (10 if not specified)
 * @param {number} max the maximum value of the zoom (400 if not specified)
 * @param {string} popupId the id of the popup (ui-zoom-popup if not specified)
 * @param {number} offsetX  The x offset of the popup in pixels (0 by default).
 * @param {number} offsetY  The y offset of the popup in pixels (0 by default).
 *
 * @example

 <doc:example>
 <doc:source>
    <ui-zoom min="20" max="150" popup-id="my-id"></ui-zoom>
 </doc:source>
 </doc:example>
 *
 */
// @ngInject
module.exports = function($rootScope) {
    return {
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-zoom/zoom.template.html',
        restrict: 'E',
        scope: {
            offsetX: '@',
            offsetY: '@',
            min: '@',
            max: '@',
            popupId: '@'
        },
        link: function(scope) {
            scope.STEP = 10;
            scope.DEFAULT = 100;
            scope.min = scope.min || 10;
            scope.max = scope.max || 400;
            scope.offsetX = scope.offsetX || 0;
            scope.offsetY = scope.offsetY || 0;
            scope.popupId = scope.popupId || 'ui-zoom-popup';

            scope.sliderModel = {
                value: scope.DEFAULT
            };

            function getZoom() {
                return parseInt(scope.sliderModel.value, 10);
            }

            // Update the zoom value after a fit-width
            scope.$on('fit-width-value', function(event, args) {
                scope.sliderModel.value = args.value;
            });

            // Zoom value changed
            scope.$watch('sliderModel.value', function() {
                var value = getZoom();
                $rootScope.$broadcast('zoom-changed', { value: value });
            });

            // Click on fit-width
            scope.fitWidth = function() {
                $rootScope.$broadcast('fit-width');
            };

            // Click on 1:1
            scope.defaultWidth = function() {
                scope.sliderModel.value = scope.DEFAULT;
            };

            scope.decrement = function() {
                var value = getZoom();
                scope.sliderModel.value = Math.max(scope.min, value - scope.STEP);
            };

            scope.increment = function() {
                var value = getZoom();
                scope.sliderModel.value = Math.min(scope.max, value + scope.STEP);
            };
        }
    };
};