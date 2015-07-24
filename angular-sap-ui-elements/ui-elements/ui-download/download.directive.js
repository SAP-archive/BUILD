'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiDownload
 *
 * @description
 * Creates a HTML link to download a file.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} style the css style to apply to the download
 *
 * @example

 <doc:example>
    <doc:source>
        <ui-download file-url="filename"></ui-download>
    </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function($compile, $timeout, $log) {
    return {
        restrict: 'E',
        scope: {
            project: '@',
            asset: '@'
        },
        replace: true,
        transclude: true,
        template: '<div ng-transclude></div>',
        link: function(scope, element, attr) {

            var iframe = angular.element(document.querySelector('#download_iframe'));

            if (!iframe.length) {
                scope.iframe = $compile('<iframe id="download_iframe" style="position:fixed;display:none;top:-1px;left:-1px;"/>');
                iframe = scope.iframe(scope);
                var body = document.getElementsByTagName('body')[0];
                angular.element(body).append(iframe);

            }

            var url = '/api/projects/' + scope.project + '/document/' + scope.asset + '/render?download=true';

            element.on('click', function(event) {
                iframe.attr('src', url);
            });

            scope.$on('assetUrlUpdated', function(event, data) {
                if (data && data.assetUrl) {
                    url = data.assetUrl;
                }
            });

            scope.$on('$destroy', function() {
                iframe = document.getElementById('download_iframe');
                if (iframe !== null && iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            });

        }
    };
};
