'use strict';

var _ = require('lodash');

// @ngInject
module.exports = function ($timeout, $compile, httpError) {

    return {
        replace: true,
        transclude: true,
        restrict: 'E',
        scope: {
            httpMessage: '='
        },
        controller: ['$scope', 'httpError', function ($scope, httpError) {
            $scope.dismiss = function () {
                httpError.dismiss($scope.httpMessage.id);
            };
        }],
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-http-error/http-error-message.template.html',
        link: function (scope, element, attrs, ctrl, transclude) {

            scope.httpMessage.isObject = false;

            if (scope.httpMessage.compileContent) {
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

            if (_.isObject(scope.httpMessage.content)) {
                scope.httpMessage.isObject = true;
            }
            else {

            }

            if (scope.httpMessage.dismissOnTimeout) {
                $timeout(function () {
                    httpError.dismiss(scope.httpMessage.id);
                }, scope.httpMessage.timeout);
            }

            if (scope.httpMessage.dismissOnClick) {
                element.bind('click', function () {
                    httpError.dismiss(scope.httpMessage.id);
                    scope.$apply();
                });
            }
        }
    };
};
