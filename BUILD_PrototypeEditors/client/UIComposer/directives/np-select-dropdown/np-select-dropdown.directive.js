'use strict';

module.exports = ['$document', function ($document) {
    return {
        restrict: 'E',
        templateUrl: 'resources/norman-prototype-editors-client/UIComposer/directives/np-select-dropdown/np-select-dropdown.html',
        replace: true,
        require: 'ngModel',
        scope: {
            list: '=',
            listItemField: '@'
        },
        link: function (scope, element, attrs, ngModelCtrl) {

            var _generateGuid = function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            };

            scope.select = {};

            scope.select.show = false;
            scope.select.instanceId = 'inst-' + _generateGuid();


            /**
             * Check if clicked outside the currently active select box
             *
             * @param e
             * @returns {boolean}
             */

            var clickHandler = function (e) {
                var $element = angular.element(e.target);
                var targetId = $element.attr('id');
                if (scope.select.instanceId === targetId) {
                    return false;
                }
                scope.select.show = false;
                scope.$digest();
                unbindEvents();
            };


            /**
             * Parse provided index in order to form selected object
             */
            var parseSelected = function () {
                ngModelCtrl.$render = function () {
                    scope.select.selected = ngModelCtrl.$modelValue || '';
                };
            };

            /**
             * Toggle drop-down list visibility
             *
             */

            scope.toggleList = function () {
                scope.select.show = !scope.select.show;
                if (scope.select.show) {
                    $document.bind('click', clickHandler);
                }
                else {
                    unbindEvents();
                }
            };

            /**
             * Select an item and run parent handler if provided

             */

            scope.selectItem = function (index) {
                scope.select.selected = scope.list[index];
                ngModelCtrl.$setViewValue(scope.select.selected);
            };

            ngModelCtrl.$viewChangeListeners.push(function () {
                scope.$eval(attrs.ngChange);
            });

            /* init parse selected */
            parseSelected();

            /* watch if list is asynchronously loaded */

            scope.$watch('list.length', function (n, o) {
                if (n !== o) {
                    parseSelected();
                }
            });

            var unbindEvents = function () {
                $document.unbind('click', clickHandler);

            };

            scope.$on('$destroy', unbindEvents);

        }
    };
}];
