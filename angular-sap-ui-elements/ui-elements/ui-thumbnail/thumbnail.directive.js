'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiThumbnail
 *
 * @description
 * Generates an image thumbnail with the supplied parameters.
 *
 * @restrict E
 * @element ANY
 *
 * @param {} dark if present, the rendered element will be applied with the dark ui-thumbnail theme.
 * @param {string} size The size of the image thumbnail to be generated.  Currently small, medium and large are supported.
 * @param {boolean} selected if true, the thumbnail gets generated with a selected border style.
 * @param {string} thumbnailSrc the source location for the thumbnail to be generated.
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-thumbnail size="large" light thumbnail-src="/resources/angular-sap-ui-elements/docs/assets/map2.png"></ui-thumbnail>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function($timeout) {
    return {
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-thumbnail/thumbnail.template.html',
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            size: '@',
            thumbnailSrc: '@',
            docType: '@',
            selected: '='
        },
        controllerAs: 'uiThumbnailCtrl',
        controller: ['$scope', '$element', '$attrs', 'uiPillProvider', uiThumbnailCtrl]
    };

    function uiThumbnailCtrl(scope, $element, attrs, uiPillProvider) {
        var elt = angular.element($element[0].firstElementChild);
        scope.hasThumb = false;

        if (scope.thumbnailSrc !== '') {
            scope.hasThumb = true;
            elt.css('background-image', "url('" + scope.thumbnailSrc + "')");
        } else {
            scope.color = uiPillProvider.getColor(scope.docType);
        }

        if (scope.selected) {
            scope.selectedClass = 'selected';
        }

        if (attrs.class !== undefined) {
            scope.customClass = attrs.class;
            elt.removeClass(attrs.class);
            $element.removeClass(attrs.class);
        }

        if (attrs.dark !== undefined) {
            scope.theme = 'dark';
        } else {
            scope.theme = 'light';
        }

        scope.$watch('selected', function(newValue, oldValue) {
            if (newValue) {
                scope.selectedClass = 'selected';

            } else if (oldValue) {
                scope.selectedClass = '';
            }
        });

        $timeout(function() {
            scope.$apply();
        });
    }
};
