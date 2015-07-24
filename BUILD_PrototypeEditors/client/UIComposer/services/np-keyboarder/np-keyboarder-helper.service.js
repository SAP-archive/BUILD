'use strict';

/**
 * The keyboard helper performs some checks wether custom operations should be performed for certain key events
 * (e.g. delete key should delete selected canvas elements only if the focus is not on a text field at the moment)
 * @namespace npKeyboarderHelper
 */

var npKeyboarderHelper = ['npConstants',
    function (npConstants) {

        /**
         * @private
         * @description Check wether the event's source element is an editable text field/area
         * @returns {boolean} true if the source element is an editable textfield or textarea, false otherwise
         */
        var noTextfieldFocused = function (event) {
            var noTextFocus = false,
                d = event.srcElement || event.target,
                tagName = d.tagName.toUpperCase(),
                type = d.type ? d.type.toUpperCase() : '';

            if ((tagName === 'INPUT' && (
                type === 'TEXT' ||
                type === 'PASSWORD' ||
                type === 'FILE' ||
                type === 'EMAIL' ||
                type === 'SEARCH' ||
                type === 'DATE')) || tagName === 'TEXTAREA') {
                noTextFocus = !!(d.readOnly || d.disabled);
            }
            else {
                noTextFocus = true;
            }
            return noTextFocus;
        };

        /**
         * @private
         * @description Used to prevent the window from scrolling left when a textfield is focused and the cursor is all the way to the left.
         */
        var preventScrollLeft = function (event) {
            if (event.srcElement.selectionStart === 0) {
                event.preventDefault();
            }
        };

        /**
         * @private
         * @description Used to prevent the window from scrolling right when a textfield is focused and the cursor is at the end of the textfield.
         */
        var preventScrollRight = function (event) {
            var textfieldValue = event.srcElement.value || '';
            if (event.srcElement.selectionStart === textfieldValue.length) {
                event.preventDefault();
            }
        };

        /**
         * @name shouldPerformCustomOperation
         * @memberof npKeyboarderHelper
         * @description Checks wether custom operations should be performed for a certain key event. Custom operations are not performed by default if an editable textfield is focused.
         * @param {object} event The source event that should be checked.
         * @returns {boolean}
         */
        var shouldPerformCustomOperation = function (event) {
            var shouldPerformAction = noTextfieldFocused(event);

            switch (event.key) {
                case npConstants.keymap.Backspace:
                    if (shouldPerformAction) {
                        event.preventDefault();
                    }
                    break;
                case npConstants.keymap.ArrowLeft:
                    if (!shouldPerformAction) {
                        preventScrollLeft(event);
                    }
                    break;
                case npConstants.keymap.ArrowRight:
                    if (!shouldPerformAction) {
                        preventScrollRight(event);
                    }
                    break;
                case npConstants.keymap.Enter:
                case npConstants.keymap.Escape:
                    shouldPerformAction = true;
                    break;
                case 'Z':
                case npConstants.keymap.z:
                    // disable default undo/redo to avoid conflicts with our own undo/redo implementation
                    if (event.metaKey || event.ctrlKey) {
                        event.preventDefault();
                        shouldPerformAction = true;
                    }
                    break;
            }

            return shouldPerformAction;
        };

        return {
            shouldPerformCustomOperation: shouldPerformCustomOperation
        };
    }
];

module.exports = npKeyboarderHelper;
