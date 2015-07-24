'use strict';

var _ = require('lodash');

// @ngInject
module.exports = function ($timeout, $compile, uiError) {

    return {
        replace: true,
        transclude: true,
        restrict: 'E',
        scope: {
            message: '='
        },
        controller: ['$scope', 'uiError', function ($scope, uiError) {
            $scope.dismiss = function () {
                uiError.dismiss($scope.message.id);
            };
        }],
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-toast/toast-message.template.html',
        link: function (scope, element, attrs, ctrl, transclude) {

            scope.message.isObject = false;

            if (scope.message.compileContent) {
                var transcludedEl;

                transclude(scope, function (clone) {
                    transcludedEl = clone;
                    element.children().append(transcludedEl);
                });

                $timeout(function () {
                    $compile(transcludedEl.contents())(scope.$parent, function (compiledClone) {
                        transcludedEl.replaceWith(compiledClone);
                    });
                }, 0);
            }

            if (_.isObject(scope.message.content)) {
                scope.message.isObject = true;
            }
            else {

            }

            if (scope.message.dismissOnTimeout) {
                $timeout(function () {
                    uiError.dismiss(scope.message.id);
                }, scope.message.timeout);
            }

            if (scope.message.dismissOnClick) {
                element.bind('click', function () {
                    uiError.dismiss(scope.message.id);
                    scope.$apply();
                });
            }
        }
    };
};
