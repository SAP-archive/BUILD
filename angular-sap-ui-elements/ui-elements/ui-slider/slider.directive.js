'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiSlider
 *
 * @description
 * Displays a value slider
 *
 * @restrict AE
 * @element ANY
 *
 * @param {sliderModel} the object being bound to the ng-model of the slider
 * @param {sliderTo} the maximum value the slider can be set to
 * @param {sliderFrom} the minimum value that the slider can be set to
 * @param {realTime} toggles whether the model updates should be done on mousemove or mouseup
 * @attribute {dark} set the css to suit being displayed on a dark background
 * @attribute {vertical} set the slider to be vertical instead of horizontal
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-slider vertical dark slider-model="model"></ui-slider>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function () {
    return {
        scope: {
            sliderModel: '=',
            sliderTo: '@',
            sliderFrom: '@',
            realTime: '@',
            cssBackground: '@',
            cssBefore: '@',
            cssAfter: '@',
            cssPointer: '@'

        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-slider/slider.template.html',
        controller: ['$scope', '$element', '$attrs', '$timeout', function($scope, $element, $attrs, $timeout) {
            $scope.initSliderOptions = function() {

                var bgColor = $attrs.dark !== undefined ? 'rgba(236, 240, 241, 0.4)' : 'rgba(44, 62, 80, 0.4)';
                var pointerColor = $attrs.dark !== undefined ? 'rgb(236, 240, 241)' : 'rgb(44, 62, 80)';

                // build the slider options object, many defaulted for now, will expose as needed
                // necessary options defined as attributes
                $scope.options = {};
                $scope.options.from = $scope.sliderFrom ? parseInt($scope.sliderFrom) : 1;
                $scope.options.to = $scope.sliderTo ? parseInt($scope.sliderTo) : 100;
                $scope.options.step = 1;
                $scope.options.dimension = '';
                $scope.options.realtime = ($scope.realTime && $scope.realTime == "true") ? true : false;
                $scope.options.vertical = $attrs.vertical !== undefined ? true : false;
                $scope.options.css = {};
                $scope.options.css.background = {'background-color': $scope.cssBackground ? $scope.cssBackground: bgColor};
                $scope.options.css.before = {'background-color': $scope.cssBefore ? $scope.cssBefore :'transparent'};
                $scope.options.css.default = {'background-color': 'transparent'};
                $scope.options.css.after = {'background-color': $scope.cssAfter ? $scope.cssAfter: 'transparent'};
                $scope.options.css.range = {'background-color': 'transparent'};
                $scope.options.css.pointer = {'background-color': $scope.cssPointer ? $scope.cssPointer: pointerColor};

                angular.element(angular.element($element[0]).children[0]).attr('options', $scope.options);

                // fix for bug in ng-slider
                $timeout(function() {
                    if($attrs.vertical !== undefined) {
                        angular.element($element[0].querySelector('.r')).css('background-color', bgColor);
                    }
                }, 10);
            };
            $scope.initSliderOptions();
        }],
        restrict: 'AE'
    };
};
