'use strict';

var npScrollableScale = ['$rootScope', 'jQuery', function ($rootScope, jQuery) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            var xScale, yScale, content;
            xScale = angular.element(element[0].getElementsByClassName('np-e-canvas-xscale'));
            yScale = angular.element(element[0].getElementsByClassName('np-e-canvas-yscale'));
            content = angular.element(element[0].getElementsByClassName('np-e-canvas-container'));
            content.bind('scroll', function () {
                addMargin(yScale, 'margin-top', -jQuery(content).scrollTop());
                addMargin(xScale, 'margin-left', -jQuery(content).scrollLeft());
            });
            var addMargin = function (scale, marginType, scrollValue) {
                jQuery(scale.children()[0]).css(marginType, scrollValue);
            };
        }
    };
}];

module.exports = npScrollableScale;
