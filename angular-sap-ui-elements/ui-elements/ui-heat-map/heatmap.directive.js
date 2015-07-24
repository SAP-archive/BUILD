'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiHeatMap
 *
 * @description Creates a heat map.
 *
 * @restrict E
 * @element ANY
 * @param {Array} data An Array of (x,y,value,radius).
 * @param {Object} gradient An object that represents the gradient (syntax: number string [0,1] : color string).
 * @param {number} radius The radius each datapoint will have (if not specified on the datapoint itself)
 * @param {number} opacity A global opacity for the whole heatmap. [0,1] *optional* default = .6
 * @param {string} container-id DOM element id on which heat map should be overlayed
 * @param {function} onClick callback function with user clicked (x,y,value)
 */
var heatMap = require('heatmap.js');

function scaleData(domain, range, data) {
        if (!domain) {
            return data;
        }
        if (domain.width === undefined) {
            domain.width = range.width;
        }
        if (domain.height === undefined) {
            domain.height = range.height;
        }
        if (domain.height == range.height &&
            domain.width == range.width) {
            return data;
        }
        var scaledData = [];
        for (var i = 0; i < data.data.length; i++) {
            var scaledPoint = {};
            var dataPoint = data.data[i];
            scaledPoint.x = dataPoint.x * (range.width / domain.width);
            scaledPoint.y = dataPoint.y * (range.height / domain.height);
            if (dataPoint.radius) {
                scaledPoint.radius = dataPoint.radius;
            }
            scaledPoint.value = dataPoint.value;

            scaledData.push(scaledPoint);
        }
        return {
            max: data.max,
            data: scaledData
        };

    }
    // @ngInject
module.exports = function ($timeout) {
    return {

        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-heat-map/heatmap.template.html',
        restrict: 'E',
        scope: {
            data: '=',
            gradient: '=',
            radius: '=',
            domain: '=',
            onClick: '&'
        },
        replace: true,
        transclude: true,
        link: function (scope, element, attrs) {
            var hmContainer = document.getElementById(attrs.containerId);
            var heatmap = heatMap.h337.create({
                container: hmContainer,
                opacity: attrs.opacity,
                radius: scope.radius,
                gradient: scope.gradient
            });
            if (scope.domain) {
                var range = {
                    height: hmContainer.offsetHeight,
                    width: hmContainer.offsetWidth
                };
                scope.data = scaleData(scope.domain, range, scope.data);
            }
            heatmap.setData(scope.data);
            hmContainer.onclick = function (event) {
                //var heatMapData = heatmap.getData();
                var value = heatmap.getValueAt({
                    x: event.offsetX,
                    y: event.offsetY
                });
                var callback = scope.onClick();
                if (callback) {
                    callback({
                        offSetX: event.offsetX,
                        offSetY: event.offsetY,
                        value: value
                    });
                }
            };

            /**
             * Watch and reset the heat map dataset when these ones change
             * @param  {object} newValue
             * @param  {object} oldValue
             */
            scope.$watch('data', function (newValue, oldValue) {
                if (newValue) {
                    heatmap.setData(newValue);
                }
            }, true);

            /**
             * Listen on broadcast event to refresh the heat map
             * - resize the canvas heat map with new dimension
             * - re paint the heat map
             * @param  {event} event
             * @param  {object} dimension {width, height} of the new canvas
             */
            scope.$on('heatmapRefresh', function (event, dimension) {
                heatmap._renderer.setDimensions(dimension.width, dimension.height);
                $timeout(function () {
                    heatmap.repaint();
                }, 10);
            });
        }
    };
};
