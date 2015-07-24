'use strict';

module.exports = ['$rootScope', '$document', '$timeout', function ($rootScope, $document, $timeout) {
    return {
        restrict: 'E',
        templateUrl: 'resources/norman-prototype-editors-client/UIComposer/ui-editor/property-panel/directives/np-binding-dropdown/np-binding-dropdown.html',
        replace: true,
        require: 'ngModel',
        scope: {
            list: '=',
            listItemField: '@',
            npValue: '=',
            npPropertyName: '=',
            npIsSmartApp: '=',
            npPropertyIsBound: '=',
            npMainEntity: '=',
            onBlur: '&',
            onKeydown: '&'
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

            scope.unbind = false;
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
                scope.displayMoreItems = false;
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
                    setFirstGroup();
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

            scope.changePropertyValue = function () {
                if (scope.changedProperty) {
                    scope.changedProperty = false;
                    scope.select.selected = undefined;
                    scope.onBlur();
                    setFirstGroup();
                }
            };

            scope.selectItem = function (index) {
                scope.select.selected = scope.list[index];
                scope.npPropertyIsBound = true;
                ngModelCtrl.$setViewValue(scope.select.selected);
                setFirstGroup();
            };

            scope.addCustomValue = function (evt) {
                scope.onKeydown();
                if (evt.keyCode === 13) {
                    scope.changePropertyValue();
                }
                else {
                    scope.changedProperty = true;
                    scope.npPropertyIsBound = false;
                }
            };

            scope.unbindProp = function () {
                scope.select.selected = undefined;
                scope.npPropertyIsBound = false;
                scope.changedProperty = false;
                scope.npValue = '';

                // Need timeout to wait for scope to digest before calling onBlur()
                $timeout(function () {
                    scope.onBlur();
                    scope.$apply();
                    $timeout(setFocus, 0);
                }, 0);
            };

            var setFocus = function () {
                var input = document.querySelector('#property-input-' + scope.select.instanceId);
                if (input && input.focus) {
                    input.focus();
                }
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

            for (var i = 0; i < scope.list.length; i++) {
                if (scope.list[i].group) {
                    scope.list[i].index = i;
                }
            }

            var setFirstGroup = function () {
                scope.items = angular.copy(scope.list);
                scope.moreItems = scope.items.filter(function (item) {
                    if (!scope.select.selected && !item.isEntity) {
                        return !item.isCurrentEntity;
                    }
                    return item.group !== scope.select.selected.group && !item.isEntity;
                });
                scope.items = scope.items.filter(function (item) {
                    if (!scope.select.selected) {
                        if (!scope.currentEntity && item.isCurrentEntity) {
                            scope.currentEntity = item.entityName;
                        }
                        return item.isCurrentEntity || item.isEntity;
                    }
                    return item.isEntity || item.group === scope.select.selected.group;
                });
                scope.displayMoreItems = false;
            };


            scope.deepEqual = function (obj1, obj2) {
                return angular.equals(obj1, obj2);
            };

            scope.toggleMoreItems = function (evt) {
                // $rootScope.$broadcast('dialog-open', 'bindMoreObjectsModal-' + scope.select.instanceId);
                evt.stopPropagation();
                scope.displayMoreItems = !scope.displayMoreItems;
            };

            scope.$on('$destroy', unbindEvents);

        }
    };
}];
