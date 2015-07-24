'use strict';

// @ngInject
module.exports = function ($location, $anchorScroll, $filter, $timeout) {

    function timeLineCtrl() {

    }

    function timeLineLink(scope) {
        var blocks;
        var uicontent;

        function onScrollEnd() {
            var uicontentBoundRect = uicontent[0].getBoundingClientRect();
            angular.forEach(blocks, function (value) {

                var $el = angular.element(value);

                var boundRect = $el[0].getBoundingClientRect();

                if (boundRect.top < (uicontentBoundRect.height / 4) * 3) {
                    $el.removeClass('is-hidden').addClass('bounce-in');
                }
            });
        }

        function show() {

            uicontent = angular.element(document.querySelectorAll('ui-content'));
            blocks = angular.element(document.querySelectorAll('.cd-timeline-block .cd-timeline-img.is-hidden, .cd-timeline-block .cd-timeline-content.is-hidden'));
            onScrollEnd();
            uicontent.on('scroll', function () {
                onScrollEnd();
            });
        }

        scope.$watch('tlevents', function () {
            $timeout(show, 300);
        });
    }

    return {
        restrict: 'E',
        scope: {
            tlevents: '='
        },
        templateUrl: 'resources/norman-projects-client/history/timeline.directive.html',
        controller: timeLineCtrl,
        controllerAs: 'timeline',
        link: timeLineLink
    };
};
