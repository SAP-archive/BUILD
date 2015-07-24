'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiProgressBar
 * @description
 * Creates a progress bar
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} value the value of the progress bar
 *
 * @example

 <doc:example>
    <doc:source>
        <ui-progress-bar current-value=""></ui-progress-bar>
    </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function ($compile, $timeout) {
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            currentValue: '@',
            maxValue: '@'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-progress-bar/progressBar.template.html',
        controllerAs: 'uiProgressBarCtrl',
        controller: ['$scope', '$element', '$attrs', uiProgressBarController]
    };

    function uiProgressBarController(scope, $element, $attrs) {
        var width = $element[0].clientWidth;
        
        var progressOffset = 10;

        if ($attrs.dark !== undefined) {
            angular.element($element).addClass('dark');
            progressOffset = 6;
        }

        scope.maxValue = scope.maxValue || 100;

        function updateProgress() {
            var progress = 0;
            if (scope.maxValue) {
                // -10 to remove the margin
                progress = (Math.min(scope.currentValue, scope.maxValue) / scope.maxValue * width) - progressOffset;
            }
            angular.element($element[0].querySelector('.progress-bar-bar')).css('width', progress + "px");
        }

        scope.$watch('currentValue', updateProgress);
        scope.$watch('maxValue', updateProgress);

        scope.$on('$destroy', function () {
            $element.detach();
        });
    }
};
