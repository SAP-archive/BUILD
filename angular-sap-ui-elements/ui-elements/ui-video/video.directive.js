'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiVideo
 * 
 * @description
 * Container for youtube videos.
 *
 * @restrict E
 *
 * @param {string} title the title of the video.
 * @param {string} src the source URL of the selected video.
 * @param {string} tileWidth the width of the thumbnail. Ex: 500px or 80% Default: 270px
 * @param {string} tileHeight the height of the thumbnail. Ex: 500px or 80% Default: 150px
 * @param {boolean} titleWithin show the video title within video. Default: false
 * @param {boolean} allowPlay use the video as a player or tile. Default: false i.e use as a thumbnail.
 

 <doc:example>
 <doc:source>
 <ui-video title="A video Title"
           tile-width="100%"
           tile-height="500px"
           title-within="true"
           src="http://www.youtube.com/embed/Rc-22UdTMqI"
           allow-play="true">
</ui-video>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function ($timeout, $window, uiFocusHelper, $sce) {
    return {
        scope: {
            title: '@',
            src: '@',
            tileWidth: '@',
            tileHeight: '@',
            titleWithin: '@',
            allowPlay: '@'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-video/video.template.html',
        restrict: 'E',
        replace: true,
        transclude: true,
        link: function (scope, elem, attrs) {

            scope.videoHeight = '100%';
            scope.videoWidth = '100%';

            if (!scope.tileWidth) {
                scope.tileWidth = '270px';
            }

            if (!scope.tileHeight) {
                scope.tileHeight = '150px';
            }

            if (scope.titleWithin) {
                scope.tileHeightStyle = {
                    height: scope.tileHeight
                };
                scope.videoHeight = '92%';
            }

            if(scope.allowPlay){
                scope.showPlayIcon = false;
                scope.playerStyle = {
                    'pointer-events' : 'none'
                };
            }else{
                scope.showPlayIcon = true;
            }
            
            scope.calcDialogWidth = function (dialogVideoWidth) {
                var width = parseInt(dialogVideoWidth) + 30 + 'px'; //margin
                return width;
            };

            $timeout(function () {
                // Ensure the title is not on the DOM as a tooltip.
                angular.element(elem).removeAttr('title');
                scope.postVideoLoad = {position: 'absolute', top: 0, left: 0};
            });

            scope.$watch('src', function (newUrlValue) {
            if (newUrlValue && typeof newUrlValue === 'string') {
                if(scope.allowPlay){
                newUrlValue = newUrlValue;
            }else{
                newUrlValue = newUrlValue + '?showinfo=0&controls=0';
            }
               scope.src = $sce.trustAsResourceUrl(newUrlValue);
            }
        });
        }
    };
};
