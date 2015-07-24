'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * The npSanpGuide service works closely with the npCanvasElementMove service to provide
 * guildelines and snapping behavior when an element is getting moved within the canvas.
 * It relies on the npGrid service to obtain all the elements on the canvas and also work
 * with the npCanvasElementMove service to keep the element being drag from leaving the
 * boundaries of the canvas.
 * @module npSnapGuide
 */

// @ngInject
var npSnapGuide = ['$rootScope', 'jQuery', 'npGrid', function ($rootScope, jQuery, npGrid) {
    var self = {};
    var elements = npGrid.getElements();
    var elementsData = null;
    var previousIsClear = false;
    var guideLineDrawned = false;
    var guideLinesTolerance = 10;
    var snappingEnabled = true;
    var returnX = false;
    var returnY = false;
    var horizontalGuides = [];
    var verticalGuides = [];

    // Calculate and return the center of the element.
    var getElementCenter = function (element) {
        var elem = jQuery(element);
        return {
            x: elem.offset().left + (elem.outerWidth(true) / 2),
            y: elem.offset().top + (elem.outerHeight(true) / 2)
        };
    };

    // Add guide lines to the x or y axis.
    var addGuideLines = function (axis, axisValue, elementAxisValue, otherElementAxisValue, elementCenter, elementAxisLength, otherElementAxisLength, nextElementAxisValue, otherNextElementAxisValue,
                                  nextElementCenter, nextElementAxisLength, otherNextElementAxisLength) {
        var axisValues = [elementAxisValue, elementCenter[axis], elementAxisValue + elementAxisLength];
        var nextElementAxisValues = [nextElementAxisValue, nextElementCenter[axis], nextElementAxisValue + nextElementAxisLength];
        var jumpToAxisValues = [[nextElementAxisValue, nextElementAxisValue - (elementAxisLength / 2), nextElementAxisValue - elementAxisLength],
            [nextElementCenter[axis], nextElementCenter[axis] - (elementAxisLength / 2), nextElementCenter[axis] - elementAxisLength],
            [nextElementAxisValue + nextElementAxisLength, nextElementAxisValue + nextElementAxisLength - (elementAxisLength / 2), nextElementAxisValue + nextElementAxisLength - elementAxisLength]];
        var axisValuesArrayLenght = axisValues.length;
        var nextElementAxisValuesArrayLenght = nextElementAxisValues.length;
        var startLocation;
        var endLocation;

        // Calculate the length of the guides, i.e., from the extremes of the moving element to the extremes of
        // the element being compared / referenced.
        if (otherElementAxisValue > otherNextElementAxisValue) {
            startLocation = otherNextElementAxisValue;
            endLocation = otherElementAxisValue + otherElementAxisLength;
        }
        else {
            startLocation = otherElementAxisValue;
            endLocation = otherNextElementAxisValue + otherNextElementAxisLength;
        }
        var length = endLocation - startLocation;

        for (var i = 0; i < nextElementAxisValuesArrayLenght; i++) {
            for (var j = 0; j < axisValuesArrayLenght; j++) {
                checkGuideLine(axisValues[j], nextElementAxisValues[i], axisValue, jumpToAxisValues[i][j], startLocation, length);
            }
        }
    };

    // Check for duplicates in guid lines
    var duplicateComparisonFunction = function (elem) {
        return JSON.stringify(elem);
    };

    var getInt = function (value) {
        return _.parseInt(value, 10);
    };

    // Keep guide lines within the canvas
    var calculateBoundariesForGuideLines = function (position, positionDesc, element, length, lengthDesc, rootElementLength) {
        if (position < 0) {
            element.style[positionDesc] = '0px';
        }
        if (position + length > rootElementLength) {
            element.style[lengthDesc] = length - ((position + length) - rootElementLength) + 'px';
        }
    };

    // Check for boundary conditions for guide lines
    var keepGuideLinesWithinCanvas = function (rootElementWidth, rootElementHeight, guides) {
        _.forEach(guides, function (element) {
            var top = getInt(element.style.top);
            var left = getInt(element.style.left);
            if (element.style.hasOwnProperty('height')) {
                calculateBoundariesForGuideLines(top, 'top', element, getInt(element.style.height), 'height', rootElementHeight);
            } else if (element.style.hasOwnProperty('width')) {
                calculateBoundariesForGuideLines(left, 'left', element, getInt(element.style.width), 'width', rootElementWidth);
            }
        });
    };

    // Recheck all drawn guide lines to make sure that nothing is drawn wrongly. This will fix the problem where two guide lines
    // are drawn in close prixmimty, i.e., within the guideLinesTolerance.
    var sanitizeGuideLines = function (x, y, elementWidth, elementHeight) {
        var rootElementStyle = npGrid.getRootElement().style;
        var rootElementWidth = getInt(rootElementStyle.width);
        var rootElementHeight = getInt(rootElementStyle.height);
        horizontalGuides = _.uniq(horizontalGuides, duplicateComparisonFunction);
        verticalGuides = _.uniq(verticalGuides, duplicateComparisonFunction);
        keepGuideLinesWithinCanvas(rootElementWidth, rootElementHeight, verticalGuides);
        keepGuideLinesWithinCanvas(rootElementWidth, rootElementHeight, horizontalGuides);
        broadCastUpdate('s', {
            returnX: x,
            returnY: y,
            xSnapPositions: [x, x + (elementWidth / 2), x + elementWidth],
            ySnapPositions: [y, y + (elementHeight / 2), y + elementHeight]
        });
    };

    // Check the guide lines to see if they are within the guideLinesTolerance, if so, create the guide line.
    var checkGuideLine = function (elementValue1, elementValue2, axis, jumpToValue, startLocation, length) {
        if (Math.abs(elementValue1 - elementValue2) < guideLinesTolerance) {
            broadCastUpdate(axis, {value: elementValue2, startLocation: startLocation, length: length});
            switch (axis) {
                case 'v':
                    returnX = jumpToValue;
                    break;
                case 'h':
                    returnY = jumpToValue;
                    break;
                default:
                    break;
            }
        }
    };

    // Make single update to the guide lines.
    // h / v - Updates the horizontal / vertical axis.
    // c - Delete all guide lines.
    // s - Delete redundant guide lines based on the real snap positions.
    var updateSnapGuide = function (axis, value) {
        switch (axis) {
            case 'h':
                horizontalGuides.push({
                    style: {
                        top: value.value + 'px',
                        left: value.startLocation + 'px',
                        width: value.length + 'px',
                        position: 'absolute'
                    }
                });
                break;
            case 'v':
                verticalGuides.push({
                    style: {
                        left: value.value + 'px',
                        top: value.startLocation + 'px',
                        height: value.length + 'px',
                        position: 'absolute'
                    }
                });
                break;
            case 'c':
                horizontalGuides = [];
                verticalGuides = [];
                break;
            case 's':
                if (value.returnX) {
                    deleteFromSnapGuides(verticalGuides, value.xSnapPositions, 'left');
                }
                if (value.returnY) {
                    deleteFromSnapGuides(horizontalGuides, value.ySnapPositions, 'top');
                }
                break;
            default:
                break;
        }
    };

    // Delete redundant guide lines from guidesArray based on current snap positions and axis info, like
    // left / top.
    var deleteFromSnapGuides = function (guidesArray, snapPositions, axisInfo) {
        var guideLinesMatchTolerance = 1.1;
        var arrayLength = guidesArray.length;
        var deleteList = [];
        var i, j;
        for (i = 0; i < arrayLength; i++) {
            var atleastOneCorrectPosition = false;
            var snapPositionsLength = snapPositions.length;
            for (j = 0; j < snapPositionsLength; j++) {
                if (Math.abs(parseFloat(guidesArray[i].style[axisInfo]) - snapPositions[j]) < guideLinesMatchTolerance) {
                    atleastOneCorrectPosition = true;
                }
            }
            // If there are no axis / center match with the element being moved, then
            // we should delete delete the redundant guide line.
            if (!atleastOneCorrectPosition) {
                deleteList.push(i);
            }
        }
        var deleteListLength = deleteList.length;
        for (i = deleteListLength; i > 0; i--) {
            guidesArray.splice(deleteList[i], 1);
        }
    };

    // Broadcast to the ui-canvas controller that the guide lines requires update.
    var broadCastUpdate = function (axis, value) {
        updateSnapGuide(axis, value);
        guideLineDrawned = true;
        previousIsClear = false;
        $rootScope.$broadcast('snapGuides/updated');
    };

    /**
     * @name clearGuideLines
     * @description Delete all guide lines on the canvas.
     */
    self.clearGuideLines = function () {
        broadCastUpdate('c');
        previousIsClear = true;
    };

    /**
     * @name updateSnapPosition
     * @description Cache the position of other elements before the target element is moved for optimization.
     * @param {number} x x-axis position.
     * @param {number} y y-axis position.
     * @param {object} element Element that is being moved.
     * @param {object} element Element that is being moved.
     */
    self.updateSnapPosition = function (x, y, element) {
        var elem = jQuery(element);
        var elementWidth = elem.outerWidth(true);
        var elementHeight = elem.outerHeight(true);
        var elementCenter = {
            x: x + (elementWidth / 2),
            y: y + (elementHeight / 2)
        };

        var arrayLength = elementsData.length;
        guideLineDrawned = false;
        returnX = false;
        returnY = false;
        for (var i = 0; i < arrayLength; i++) {
            addGuideLines('x', 'v', x, y, elementCenter, elementWidth, elementHeight, elementsData[i].x, elementsData[i].y, elementsData[i].center, elementsData[i].width, elementsData[i].height);
            addGuideLines('y', 'h', y, x, elementCenter, elementHeight, elementWidth, elementsData[i].y, elementsData[i].x, elementsData[i].center, elementsData[i].height, elementsData[i].width);
        }

        // Check if guidliens are drawn at the new position that the element
        // moved to, if not, clear all the guide lines.
        if (!guideLineDrawned && !previousIsClear) {
            self.clearGuideLines();
        }
        else {
            // Sanitizing the guide lines will remove some redundant guide lines that
            // are drawn as you drag a few pixels within the guideLinesTolerance.
            sanitizeGuideLines(returnX, returnY, elementWidth, elementHeight);
            if (!snappingEnabled) {
                returnX = returnY = false;
            }
            return {x: returnX, y: returnY};
        }
    };

    /**
     * @name updateElementsPositions
     * @description Cache the position of other elements before the target element is moved for optimization.
     * @param {object} controlBeingMoved DOM reference to the target element that is being moved.
     */
    self.updateElementsPositions = function (controlBeingMoved) {
        elementsData = [];

        if (elements.length > 0) {
            _.forEach(elements.concat(elements[0].children), function (element) {
                if (element !== controlBeingMoved) {
                    var elem = jQuery(element.domRef());
                    var layoutData = {};
                    layoutData.width = elem.outerWidth(true);
                    layoutData.height = elem.outerHeight(true);
                    layoutData.x = elem.offset().left;
                    layoutData.y = elem.offset().top;
                    layoutData.center = getElementCenter(element.domRef());
                    elementsData.push(layoutData);
                }
            });
        }
    };

    /**
     * @name getVerticalgetHorizontalGuidesGuides
     * @description Get the horizontal guide lines.
     */
    self.getHorizontalGuides = function () {
        return horizontalGuides;
    };

    /**
     * @name getVerticalGuides
     * @description Get the vertical guide lines.
     */
    self.getVerticalGuides = function () {
        return verticalGuides;
    };

    /**
     * @name setSnappingEnabled
     * @description Enable or disable the snapping behavior.
     * @param {boolean} snappingEnabledValue true sets snapping to enabled and vice versa.
     */
    self.setSnappingEnabled = function (snappingEnabledValue) {
        snappingEnabled = snappingEnabledValue;
    };

    return self;
}];

module.exports = npSnapGuide;
