'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:ui-video-you-tube
 *
 * @description
 * creates iframe for the youtube video.
 *
 * @restrict EA
 *
 */

// @ngInject
module.exports = function ($sce) {
  return {
    restrict: 'EA',
    scope: {
        source: '@',
        height: '@',
        width: '@'
    },
    replace: true,
    template: '<div ng-style="tileWrapperStyle"><iframe style="overflow:hidden;height:100%;width:100%" src="{{url}}" frameborder="0" allowfullscreen="0" sandbox="allow-same-origin allow-scripts"></iframe></div>',
    link: function (scope) {

        if(!scope.height){
          scope.height = '100%';
        }
        if(!scope.width){
          scope.width = '100%';
        }

        scope.tileWrapperStyle = {
          height: scope.height,
          width: scope.width
        };

        scope.$watch('source', function (newUrlValue) {
           if (newUrlValue) {
            if (newUrlValue.split('?').length === 1) {
              scope.url = $sce.trustAsResourceUrl(newUrlValue + '?rel=0&html5=1&modestbranding=1');
            } else {
              scope.url = $sce.trustAsResourceUrl(newUrlValue + '&rel=0&html5=1&modestbranding=1');
            }
           }

        });
    }
  };
};
