'use strict';

var d3 = require('norman-client-tp').d3;
var _ = require('norman-client-tp').lodash;

var npScale = ['npScaleHelperService', 'npGrid', 'npFormFactor', 'npZoomHelper',
    function (npScaleHelperService, npGrid, npFormFactor, npZoomHelper) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                var unbindHighlightCollection;
                var scaleType = element.attr('type');

                d3.select(element[0]).append('svg')
                    .attr('class', 'np-e-svg-' + scaleType)
                    .append('g')
                    .attr('class', 'np-e-g-' + scaleType);

                scope.$watch(function watchFormFactorChange() {
                    return npFormFactor.getCurrentFormFactor();
                }, function () {
                    renderAxis(element);
                });

                var changeScaleHighlight = function (zoomLevel) {
                    var selectedElements = npGrid.getSelectedElements();
                    var elem;
                    if (!zoomLevel) {
                        zoomLevel = npZoomHelper.getZoomLevel();
                    }
                    // Change this when multi-selection is enabled
                    if (selectedElements) {
                        elem = selectedElements[0];
                    }
                    if (unbindHighlightCollection) {
                        unbindHighlightCollection();
                    }
                    if (elem) {
                        // Set a watch on the DOM value of the selected element
                        unbindHighlightCollection = scope.$watch(function watchElementDimensions() {
                            return elem.style;
                        }, function () {
                            callRendererOrhighlight('highlight', zoomLevel, elem);
                        }, true);

                        callRendererOrhighlight('highlight', zoomLevel, elem);
                    }
                    else {
                        callRendererOrhighlight('highlight', zoomLevel, elem);
                    }
                };

                var callRendererOrhighlight = function (type, zoomLevel, element) {
                    var scaleElements = npScaleHelperService.getAllElements();
                    _.forEach(scaleElements, function (elem) {
                        if (type === 'render') {
                            renderAxis(elem, zoomLevel);
                        }
                        else if (type === 'highlight') {
                            npScaleHelperService.renderHighlight(element, elem, zoomLevel);
                        }
                    });
                };

                var renderAxis = function (element, zoomLevel) {
                    // removing the scale
                    d3.select(element[0]).select('svg').select('g').selectAll('*').remove();
                    npScaleHelperService.scaleRenderer(element, zoomLevel);
                    changeScaleHighlight(zoomLevel);
                };

                var cleanup = function () {
                    if (unbindHighlightCollection) {
                        unbindHighlightCollection();
                    }
                };

                scope.$on('zoom-changed', function (event, args) {
                    callRendererOrhighlight('render', args.value / 100);
                });

                scope.$on('selectionChanged', function () {
                    changeScaleHighlight();
                });
                scope.$on('npGrid/layoutUpdated', function () {
                    changeScaleHighlight();
                });
                scope.$on('$destroy', cleanup);
            }
        };
    }
];

module.exports = npScale;
