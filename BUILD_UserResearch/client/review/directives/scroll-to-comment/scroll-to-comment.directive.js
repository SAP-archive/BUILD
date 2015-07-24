/*global angular, module, document, require */
'use strict';

/**
 * @ngdoc directive
 * @name scroll-to-comment
 *
 * @description
 * Scroll the comment container to display the selected comment in ST mode
 *
 */

// @ngInject
module.exports = function ($timeout) {
    return {
        restrict: 'EA',
        scope: {},
        // @ngInject
        controller: function ($scope, $element, $attrs, scrollToCommentApi) {
            $scope.api = scrollToCommentApi;

            $scope.scrollToComment = function (elt) {
                var myElement = elt;

                $timeout(function () {
                    var parent = myElement.parent();

                    if (parent.hasClass('smart-template')) {
                        var tabContainer = parent.parent();
                        var newTop = myElement[0].offsetTop;
                        tabContainer[0].scrollTop = newTop;
                    }
                }, 400, [myElement]);
            };

            // Add event
            $timeout(function () {
                $scope.api.addUpdateEvent($scope.scrollToComment, $element);
            }, 0);
        }
    };
};
