'use strict';
var d3 = require('norman-client-tp').d3,
    _ = require('norman-client-tp').lodash;

var npScaleHelperService = ['jQuery', '$document', '$window', 'npFormFactor', 'npZoomHelper', 'npConstants', function (jQuery, $document, $window, npFormFactor, npZoomHelper, npConstants) {
    var scaleConstants = npConstants.scale;
    var SCALESETDIMENSION = scaleConstants.SCALESETDIMENSION;
    /**
     * @name selectAllText
     * @description Adds style textAnchor and dx, dy attributes for the svg grouping element
     * @param {object} axisG grouping element for the axis
     * @param {string} textAnchor attribute
     * @param {string} x coordinate from x
     * @param {string} y coordinate from y
     */
    var selectAllText = function (axisG, textAnchor, x, y) {
        return axisG.selectAll('text')
            .style('text-anchor', textAnchor)
            .attr('x', x)
            .attr('y', y);
    };

    var _getStyleValues = function (element, css) {
        return _.parseInt($window.getComputedStyle(element, null).getPropertyValue(css));
    };

    /**
     * @name scaleRenderer
     * @description Renders the scale
     * @param {object} element - dom element
     * @param {object} zoom - zoom value for the scale
     */
    var scaleRenderer = function (element, zoom) {
        var leftPadding = 0, topPadding = 0;
        var selectedScale = element.attr('type');
        var MAJORTICKS = scaleConstants.MAJORTICKS;
        var orient, attribute1, attribute2, attribute3, attribute4;

        if (!zoom) {
            zoom = npZoomHelper.getZoomLevel();
        }

        var scaleValues = calculateScaleValues(element, zoom);

        var scaleHeight = scaleValues.scaleHeight,
            scaleWidth = scaleValues.scaleWidth,
            roundScaleValue = scaleValues.roundScaleValue,
            range = scaleValues.roundScaleRange;

        var innerContainer = $document[0].getElementsByClassName('np-e-canvas-container-inner')[0];
        var container = $document[0].getElementsByClassName('np-c-container')[0];

        if (innerContainer && container) {
            leftPadding = _getStyleValues(innerContainer, 'padding-left') + zoom * (20 + _getStyleValues(container, 'padding-left'));
            topPadding = _getStyleValues(innerContainer, 'padding-top') + zoom * (20 + _getStyleValues(container, 'padding-top'));
        }

        switch (selectedScale) {
            case 'xscale':
                orient = 'top';
                attribute1 = 'x1';
                attribute2 = 'x2';
                attribute3 = 'y1';
                attribute4 = 'y2';
                break;
            default:
                orient = 'left';
                attribute1 = 'y1';
                attribute2 = 'y2';
                attribute3 = 'x1';
                attribute4 = 'x2';
                break;
        }

        var scaleSvg = d3.select(element[0]).select('.np-e-svg-' + selectedScale);
        var svg = scaleSvg
            .attr('height', scaleHeight)
            .attr('width', scaleWidth)
            .select('g')
            .attr('height', scaleHeight)
            .attr('width', scaleWidth);

        var x = d3.scale.linear()
            .domain([0, roundScaleValue])
            .range([0, range]);

        var myScale = d3.svg.axis().scale(x);

        var noOfTicks = (range > scaleConstants.RANGEOFWIDTHFORNOOFTICKS) ? (roundScaleValue / MAJORTICKS + 1) : (range / MAJORTICKS + 1);
        var noOfMinorTicks = range / scaleConstants.TICKS;
        var axis = myScale.orient(orient).ticks(noOfTicks).tickSize(scaleConstants.TICKSIZE, 0);
        var axisG = svg.append('g')
            .attr('class', 'np-e-axis')
            .call(axis);

        axisG.selectAll('line').data(x.ticks(noOfMinorTicks), function (d) {
            return d;
        })
            .enter()
            .append('line')
            .attr('class', 'np-e-minor')
            .attr(attribute1, x)
            .attr(attribute2, x)
            .attr(attribute3, 0)
            .attr(attribute4, function (d) {
                //d for the tick value
                if ((d / 10) % 5 === 0) { //if it's an even multiple of 5%
                    return scaleConstants.HEIGHTOFMAJORTICK;//height of the tick
                } else {
                    return scaleConstants.HEIGHTOFMINORTICK;//height of the tick
                }
            });

        if (selectedScale === 'xscale') {
            selectAllText(axisG, 'start', scaleConstants.XFORXSCALETICKS, scaleConstants.YFORXSCALETICKS);
            scaleSvg.attr('style', 'Padding: 0 ' + leftPadding + 'px');
        }
        else {
            selectAllText(axisG, 'end', scaleConstants.XFORYSCALETICKS, scaleConstants.YFORYSCALETICKS).attr('transform', function () {
                return 'rotate(-90)';
            });
            scaleSvg.attr('style', 'Padding:' + topPadding + 'px 0');
        }

    };

    /**
     * @name appendRect
     * @description appends the elements and its attributes on the scale
     * @param {object} axisG - dom element
     * @param {number} x coordinate
     * @param {number} y coordinate
     * @param {number} width - width of the element to be highlighted
     * @param {number} height - height of the element to be highlighted
     * @param {string} cssClass - class to be applied
     */
    var appendRect = function (axisG, x, y, width, height, cssClass) {
        var rect = axisG.insert('rect', 'g');
        addAttributes(rect, 'x', x);
        addAttributes(rect, 'y', y);
        addAttributes(rect, 'width', width);
        addAttributes(rect, 'height', height);
        addAttributes(rect, 'class', cssClass);
    };

    /**
     * @name addAttributes
     * @description adds the attributes to the scale
     * @param {Object} axisType dom element
     * @param {string} attr - attribute to be appended
     * @param {number} value - value to be appended
     */
    var addAttributes = function (axisType, attr, value) {
        axisType.attr(attr, value);
    };

    /**
     * @name getAllElements
     * @description gets all elements of type scale
     * @returns {elements[]} Array of elements with np-scale directive
     */
    var getAllElements = function () {
        var xscale = jQuery(angular.element(document.getElementsByClassName('np-e-canvas-xscale')));
        var yscale = jQuery(angular.element(document.getElementsByClassName('np-e-canvas-yscale')));
        var matchingElements = [];
        matchingElements.push(xscale);
        matchingElements.push(yscale);
        return matchingElements;
    };

    /**
     * @name renderHighlight
     * @description Renders the coloring on the scale
     * @param {object}  selectedElem - control selected
     * @param {object}  selectedScale - scale type (horizontal or vertical)
     */
    var renderHighlight = function (selectedElem, selectedScale, zoomLevel) {
        var controlLeft = 0, controlTop = 0, controlWidth = 0, controlHeight = 0;
        var selectedScaleType = selectedScale.attr('type');

        if (selectedElem) {
            var width = _.parseInt(selectedElem.style.width) * zoomLevel || 0;
            var height = _.parseInt(selectedElem.style.height) * zoomLevel || 0;
            controlLeft = _.parseInt(selectedElem.style.left) * zoomLevel || 0;
            controlTop = _.parseInt(selectedElem.style.top) * zoomLevel || 0;
            controlWidth = width > 0 ? width : 0;
            controlHeight = height > 0 ? height : 0;
        }
        var axisG = d3
            .select(selectedScale[0]).select('svg').select('g');
        // remove all previous items before render
        axisG.selectAll('rect').remove();

        if (selectedScaleType === 'xscale') {
            appendRect(axisG, controlLeft, -SCALESETDIMENSION, controlWidth, SCALESETDIMENSION, 'np-e-bg-color-white');
        }
        else {
            appendRect(axisG, -SCALESETDIMENSION, controlTop, SCALESETDIMENSION, controlHeight, 'np-e-bg-color-white');
        }
    };

    /**
     * @name calculateScaleValues
     * @description Renders the coloring on the scale
     * @param {object}  element - control selected
     * @param {object}  zoom - scale type (horizontal or vertical)
     * @returns {object} scaleValues - returns the scale Values width, height, length
     */
    var calculateScaleValues = function (element, zoom) {
        var scaleValues = {
            scaleHeight: 0,
            scaleWidth: 0,
            scaleLength: 0,
            roundScaleRange: 0,
            roundScaleValue: 0
        };
        //get the content
        var currentFormFactor = npFormFactor.getCurrentFormFactor();
        var width = _.parseInt(currentFormFactor.width), height = _.parseInt(currentFormFactor.height);
        var scaleT = element.attr('type');

        if (scaleT === 'xscale') {
            scaleValues = _computeValuesHelper(width, zoom);
            scaleValues.scaleHeight = SCALESETDIMENSION;
            scaleValues.scaleWidth = scaleValues.scaleLength;
        } else if (scaleT === 'yscale') {
            scaleValues = _computeValuesHelper(height, zoom);
            scaleValues.scaleWidth = SCALESETDIMENSION;
            scaleValues.scaleHeight = scaleValues.scaleLength;
        }
        return scaleValues;
    };

    var _computeValuesHelper = function (formFactorValue, zoom) {
        var values;
        var scaleLength = (formFactorValue) * zoom;
        var roundScaleValue = (50 * Math.ceil(formFactorValue / 50)) || 0;
        var diffInRoundValue = roundScaleValue - formFactorValue;
        var roundScaleRange = (formFactorValue + diffInRoundValue) * zoom;

        values = {
            scaleLength: scaleLength,
            roundScaleRange: roundScaleRange,
            roundScaleValue: roundScaleValue
        };
        return values;
    };

    return {
        scaleRenderer: scaleRenderer,
        renderHighlight: renderHighlight,
        getAllElements: getAllElements
    };
}];

module.exports = npScaleHelperService;
