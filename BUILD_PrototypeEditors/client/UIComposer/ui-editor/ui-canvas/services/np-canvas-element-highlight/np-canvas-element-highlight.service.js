'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * The npElementHighlight service is used to highlight the appropriate element when the mouse pointer is hovering
 * over the canvas.
 * @module npElementHighlight
 */

// @ngInject
var npCanvasElementHighlight = ['$rootScope', '$timeout', 'npGridPosition',
    function ($rootScope, $timeout, npGridPosition) {
        var self = {};
        var elementHighlights = [];
        var highlightedElement;
        var previousControlData, previousElementX, previousElementY;

        /**
         * @name highlightElementAtPosition
         * @description Highlights the deepest element at a specified position.
         * @param {Object} controlMd
         * @param {number} elementX CSS left (canvas coords)
         * @param {number} elementY CSS top (canvas coords)
         * @returns {Object} highlighted element
         */
        self.highlightElementAtPosition = _.throttle(function (controlData, elementX, elementY) {
            if (controlData && (controlData !== previousControlData || elementX !== previousElementX || elementY !== previousElementY)) {
                var sibling = npGridPosition.getSiblingAtPosition(controlData, elementX, elementY);
                var siblingStyle;
                if (_.isEmpty(sibling)) {
                    self.clearElementHighlights();
                }
                else {
                    siblingStyle = controlData.isBinding ? npGridPosition.getStyleForBinding(sibling, controlData, elementX, elementY) : _.clone(sibling.style);
                    delete siblingStyle.visibility;
                    elementHighlights = [{
                        style: _.extend(siblingStyle, {
                            position: 'absolute',
                            'pointer-events': 'none'
                        })
                    }];
                    highlightedElement = sibling;
                    previousControlData = controlData;
                    previousElementX = elementX;
                    previousElementY = elementY;
                    $rootScope.$broadcast('elementHighlight/updated', highlightedElement);
                }
            }

            return highlightedElement;
        }, 100);

        /**
         * @name getElementHighlights
         * @description Get the element highlights array.
         */
        self.getElementHighlights = function () {
            return elementHighlights;
        };

        /**
         * @name clearElementHighlights
         * @description Clear the element highlights array.
         */
        self.clearElementHighlights = function () {
            self.highlightElementAtPosition.cancel();
            previousControlData = previousElementX = previousElementY = undefined;
            elementHighlights = [];
            highlightedElement = undefined;
            $rootScope.$broadcast('elementHighlight/updated');
        };

        return self;
    }
];

module.exports = npCanvasElementHighlight;
