'use strict';
var _ = require('norman-client-tp').lodash;

var npZoomHandler = ['$window', 'npConstants', 'npFormFactor', function ($window, npConstants, npFormFactor) {
    return {
        restrict: 'A',
        link: function (scope, element) {

            var calcZoom = function (availableWidth, canvasWidth, margin) {
                return Math.floor(((availableWidth - margin) / canvasWidth) * 100);
            };

            scope.$on('fit-width', function () {
                var canvasContainer = element[0],
                    highThreshold = npConstants.zoomThreshold.high,
                    lowThreshold = npConstants.zoomThreshold.low,
                    canvasWidth = _.parseInt(npFormFactor.getCurrentFormFactor().width),
                    availableWidth = canvasContainer.clientWidth,
                    canvas = canvasContainer.getElementsByClassName('np-c-container-js')[0],
                    padding = _.parseInt($window.getComputedStyle(canvas, null).getPropertyValue('padding-left')) || 0,
                    //InOrder to keep the same distance on both sides of the width
                    margin = (npConstants.scale.SCALESETDIMENSION + padding) * 2,
                    zoomToBeSet = calcZoom(availableWidth, canvasWidth, margin);

                //calibrating zoom once more here as, zoom > 100 expands the margin as well and
                //helps in fit to width of mobile form factors
                if (zoomToBeSet > 100) {
                    margin = (margin) * zoomToBeSet / 100;
                    zoomToBeSet = calcZoom(availableWidth, canvasWidth, margin);
                }

                if (zoomToBeSet < lowThreshold) {
                    zoomToBeSet = lowThreshold;
                }
                else if (zoomToBeSet > highThreshold) {
                    zoomToBeSet = highThreshold;
                }
                scope.$broadcast('fit-width-value', {value: zoomToBeSet});
            });

        }
    };
}
];

module.exports = npZoomHandler;
