'use strict';

var _ = require('norman-client-tp').lodash;

// TODO this code has been inactive for a while, needs some review and rework most likely to work again
var npMultiSelectDrag;
npMultiSelectDrag = ['$document', 'jQuery', 'npGrid', function ($document, jQuery, npGrid) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            var selectElement;
            var startX, startY, initialMouseX, initialMouseY, top, left, width, height, scrollTop, scrollLeft, scrollBottom, scrollRight, defaultScrollTop, defaultScrollLeft;
            var selectionElements;
            var box = angular.element(document.getElementsByClassName('selectionBox'));
            var triggerClass = 'np-c-multi-select-js';
            var content = angular.element(document.getElementsByClassName('np-e-canvas-container'));

            // on mousedown - get the positions of the click
            var startSelection = function (event) {
                clearValues();
                if (_.contains(event.target.classList, triggerClass)) {
                    startX = jQuery(element).offset().left;
                    startY = jQuery(element).offset().top;
                    initialMouseX = event.clientX;
                    initialMouseY = event.clientY;
                    defaultScrollLeft = jQuery(content).scrollLeft();
                    defaultScrollTop = jQuery(content).scrollTop();
                    element.on('mousemove', selectElement);
                    element.on('mouseup', endSelection);
                    content.on('scroll', getScrollValues);
                }
            };

            // on scroll event on canvas. Updates scroll values of the canvas.
            var getScrollValues = function () {
                scrollTop = jQuery(content).scrollTop();
                scrollLeft = jQuery(content).scrollLeft();
                scrollBottom = defaultScrollTop - scrollTop;
                scrollRight = defaultScrollLeft - scrollLeft;
            };

            // on mousemove - check for 4 possible scenarios to start dragging and update the width and height of the box
            selectElement = function (event) {
                width = event.clientX - initialMouseX;
                height = event.clientY - initialMouseY;
                // To avoid negative values for the scroll distance moved
                scrollRight = Math.max(0, scrollRight);
                scrollTop = Math.max(0, scrollTop);
                if (width >= 0) {
                    left = initialMouseX - startX;
                    // Start from top-left
                    if (height > 0) {
                        width = event.clientX + scrollLeft - initialMouseX;
                        height = event.clientY + scrollTop - initialMouseY;
                        top = initialMouseY - startY;
                    }
                    // Start from bottom-left
                    else {
                        width = event.clientX + scrollLeft - initialMouseX;
                        height = initialMouseY - event.clientY + scrollBottom;
                        top = initialMouseY - startY - height;
                    }
                }
                else {
                    width = initialMouseX - event.clientX;
                    // Start from top-right
                    if (height > 0) {
                        height = event.clientY - initialMouseY + scrollTop;
                        width = initialMouseX - event.clientX + scrollRight;
                        left = initialMouseX - startX - width;
                        top = initialMouseY - startY;
                    }
                    // Start from bottom-right
                    else {
                        width = initialMouseX - event.clientX + scrollRight;
                        height = initialMouseY - event.clientY + scrollBottom;
                        left = initialMouseX - startX - width;
                        top = initialMouseY - startY - height;
                    }
                }

                box.css({
                    top: top + 'px',
                    left: left + 'px',
                    border: '1px dotted black',
                    position: 'absolute',
                    width: width + 'px',
                    height: height + 'px'
                });
            };

            // on mouseup - gets all the elements inside the box using getAllElementsInsideSelectionBox() method
            // broadcasts the multiSelectElements function so all the items inside the box are selected
            var endSelection = function () {
                selectionElements = getAllElementsInsideSelectionBox();
                if (selectionElements.length) {
                    npGrid.setSelectedElements(selectionElements);
                }
                clearSelection();
            };

            /*Gets all the elements and checks which of the them are inside the box using isBoxOnElement(control) method
             returns overlapping controls*/
            var getAllElementsInsideSelectionBox = function () {
                var overlappingElements = [],
                    gridElements = npGrid.getElements();
                _.forEach(gridElements, function (elem) {
                    if (isBoxOnElement(elem)) {
                        overlappingElements.push(elem);
                    }
                });
                return overlappingElements;
            };

            // Check if the control is inside the box or the surrounded area
            var isBoxOnElement = function (control) {
                // element values
                var elemTop = _.parseInt(control.style.top.replace('px', ''));
                var elemLeft = _.parseInt(control.style.left.replace('px', ''));
                var elemRight = elemLeft + _.parseInt(control.style.width.replace('px', ''));
                var elemBottom = elemTop + _.parseInt(control.style.height.replace('px', ''));

                // selection box values
                var boxTop = top;
                var boxLeft = left;
                var boxRight = left + width;
                var boxBottom = top + height;

                // possible conditions
                if (elemLeft > boxRight || elemRight < boxLeft) {
                    return false;
                } // overlap not possible
                if (elemTop > boxBottom || elemBottom < boxTop) {
                    return false;
                } // overlap not possible

                if (elemLeft > boxLeft && elemLeft < boxRight) {
                    return true;
                }
                if (elemRight > boxLeft && elemRight < boxRight) {
                    return true;
                }

                if (elemTop > boxTop && elemTop < boxBottom) {
                    return true;
                }
                if (elemBottom > boxTop && elemBottom < boxBottom) {
                    return true;
                }

                return false;
            };

            // called from mouseup - clear the box selection and reset the values
            var clearSelection = function () {
                clearValues();
                box.css({
                    top: '0px',
                    left: '0px',
                    border: 'none',
                    position: 'absolute',
                    width: '0px',
                    height: '0px'
                });
                element.off('mousemove', selectElement);
                element.off('mouseup', endSelection);
            };

            // reset all values
            var clearValues = function () {
                top = 0;
                left = 0;
                width = 0;
                height = 0;
                selectionElements = [];
                startX = 0;
                startY = 0;
                initialMouseX = 0;
                initialMouseY = 0;
                scrollTop = 0;
                scrollLeft = 0;
                scrollRight = 0;
                scrollBottom = 0;
                defaultScrollTop = 0;
                defaultScrollLeft = 0;
            };

            element.on('mousedown', startSelection);

        }
    };
}];

module.exports = npMultiSelectDrag;
