'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiStudyTile
 *
 * @description
 * Creates a tile representation for a study with name, users and study image displayed.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} studyName The name that has been entered for the study
 * @param {string} studyImage The image reference that will be used for the study
 * @param {object} studyModel The study model being bound to the tile
 * @param {string} studyId The Id of the study (in order to recreate study link)
 * @param {string} projectId  The Id of the project the study is linked to (in order to recreate study link)
 * @param {string} baseUrl The baseUrl of the current server (in order to recreate study link)
 * @param {string} type The type of study tile we are showing (participants see less content then project creators)
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-study-tile study-name="Test study" study-image="url(../resources/angular-sap-ui-elements/assets/sample_study.png)"></ui-study-tile>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function ($timeout, $compile) {
    return {
        scope: {
            idx: '@',
            name: '@',
            id: '@',
            thumb: '@',
            comments: '@',
            participants: '@',
            annotations: '@',
            projectId: '@',
            status: '@',
            date: '@',
            url: '@',
            onSelect: '&',
            type: '@'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-study-tile/studyTile.template.html',
        restrict: 'E',
        replace: true,
        transclude: true,
        link: function (scope, element, attrs) {
            scope.openStudy = function () {
                scope.onSelect();
            };

            // Add the study link url popup if not already present.
            var existingPopup = document.getElementById('study-url-popup-' + scope.idx);
            if (!existingPopup) {
                var popup = '<ui-popup id="study-url-popup-' + scope.idx
                    + '" class="study-url-popup" placement="bottom" on-fully-open="selectLink()"><label>Participant link</label><br><ui-input ng-readonly="true" value="{{url}}" id="study-url-input-' + scope.idx + '" click-highlight></ui-input></ui-popup>';
                scope.urlPopup = $compile(popup);
                angular.element(document.getElementsByTagName('body')[0]).append(scope.urlPopup(scope));
            }

            // fix to dynamically add title attribute based on text length: http://stackoverflow.com/a/16478893
            scope.addTitle = function() {
                var ele = angular.element(document.querySelector('.study-tile-title-' + scope.idx));
                var studyTileTitle = ele[0];
                if(!studyTileTitle) {
                    return;
                }
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                ctx.font = "600 22px/28px Roboto, Helvetica, Arial, sans-serif";
                var textWidth = ctx.measureText(studyTileTitle.innerText).width;

                // double the offset width as text is spread over two lines
                if(studyTileTitle && ((studyTileTitle.offsetWidth * 2) < textWidth)) {
                    studyTileTitle.title = studyTileTitle.innerText;
                }
            };

            scope.selectLink = function() {
                $timeout(function() {
                    var input = document.getElementById('study-url-input-' + scope.idx);
                    if (input && input.select) {
                        input.select();
                    }
                }, 100);
            }

            $timeout(scope.addTitle, 10);

            scope.$on('$destroy', function () {
                element.remove();
                var popup = angular.element(document.querySelector('#study-url-popup-' + scope.idx));
                popup.remove();
            });
        }
    };
};
