'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * The npCanvasInlineEdit directive handles inline editing of elements on the canvas
 */

var npCanvasInlineEdit = ['npGrid', 'npUiCanvasAPI', 'npCanvasInteractionHelper', '$compile', '$timeout', 'npConstants', 'npKeyboarder', 'npCanvasInlineEditHelper', 'npPageMetadata', 'npPropertyChangeObserver',
    function (npGrid, npUiCanvasAPI, npCanvasInteractionHelper, $compile, $timeout, npConstants, npKeyboarder, inlineEditHelper, npPageMetadata, npPropertyChangeObserver) {
        return {
            restrict: 'A',
            link: function (scope, element) {

                var inputField, domRef, property, controlMd;

                /**
                 * @private
                 * @description Is called when edit property is requested (e.g. by single or double click)
                 */
                var onInlineEditStart = function (possibleElements, x, y) {
                    if (inputField) {
                        return;
                    }
                    var prop, foundElem;
                    // for all rendered candidates: find the element that has the property we clicked on
                    _.find(possibleElements, function (elem) {
                        var p = npUiCanvasAPI.getEditablePropertyAtPosition(elem.controlMd, x, y);
                        if (p) {
                            prop = p;
                            foundElem = elem;
                            return true;
                        }
                    });
                    if (prop && foundElem && !prop.isBound) {
                        npGrid.setSelectedElements([foundElem]);
                        var dRef = prop.domRef;
                        delete prop.domRef;
                        editProperty(dRef, foundElem.controlMd, prop, x, y);
                    }
                    else {
                        inlineEditHelper.stopInlineEdit();
                    }
                };

                /**
                 * @private
                 * @description Will create and add the edit-input field to the dom and select its content
                 */
                var editProperty = function (dRef, ctrlMd, prop, x, y) {
                    controlMd = ctrlMd;
                    property = prop;
                    domRef = dRef;
                    property.oldValue = prop.value;
                    scope.inputValue = prop.value;
                    inputField = createInputField(dRef, x, y);
                    element.append(inputField);
                    dRef.style.visibility = 'hidden';
                    $timeout(function () {
                        inputField[0].select();
                    });
                };

                /**
                 * @private
                 * @description Propagates changes
                 */
                scope.onInputType = function () {
                    npPropertyChangeObserver.doPropertyChange(controlMd, {
                        name: property.name,
                        value: scope.inputValue
                    });
                };

                /**
                 * @private
                 * @description Propagates property changes (e.g. to the property panel),
                 * applies changes to the control,
                 * removes the input field from dom
                 */
                scope.onInputLoseFocus = function () {
                    endInlineEdit(scope.inputValue);
                };

                var onEnter = function () {
                    endInlineEdit(scope.inputValue);
                };

                var onEscape = function () {
                    if (!_.isUndefined(property)) {
                        endInlineEdit(property.oldValue);
                    }
                };

                /**
                 * @private
                 * @description Finishes the inline edit by updating the property panel with the final value,
                 * persisting that value and doing necessary cleanup
                 */
                var endInlineEdit = function (value) {
                    if (!inputField) {
                        return;
                    }
                    inlineEditHelper.stopInlineEdit();
                    persistPropertyValue(value);
                    npPropertyChangeObserver.endPropertyChange(controlMd, property);
                    destroyInputField();
                };

                /**
                 * @private
                 * @description Applies property change to control and refreshes grid
                 */
                var persistPropertyValue = function (value) {
                    property.value = value;
                    npPageMetadata.changeProperty({
                        controlId: controlMd.controlId,
                        properties: [{
                            name: property.name,
                            value: property.value
                        }]
                    });
                };

                /**
                 * @private
                 * @description Creates a transparent input field on top of the Canvas domRef
                 */
                var createInputField = function (dRef) {
                    var rect = dRef.getBoundingClientRect();
                    var style = window.getComputedStyle(dRef);
                    var fontSize = _.parseInt(style.fontSize) / 2;
                    var textWidth = property.value.length * fontSize;
                    var textAlignment = Math.floor(rect.width) > textWidth ? style.textAlign : 'left';
                    var input = angular.element(document.createElement('input'));
                    input.attr({
                        type: 'text',
                        'ng-model': 'inputValue',
                        'ng-change': 'onInputType();',
                        'ng-blur': 'onInputLoseFocus();'
                    });
                    input.css({
                        left: rect.left + 'px',
                        top: rect.top + 'px',
                        position: 'absolute',
                        border: 'none',
                        'background-color': 'transparent',
                        width: textWidth + 'px',
                        'min-width': style.width,
                        padding: style.padding,
                        font: style.font,
                        color: style.color,
                        'text-align': textAlignment,
                        'text-decoration': style.textDecoration,
                        'text-indent': style.textIndent,
                        'text-overflow': style.textOverflow,
                        'text-shadow': style.textShadow,
                        'text-transform': style.textTransform
                    });
                    input = $compile(input)(scope);
                    return input;
                };

                var kl1 = npKeyboarder.on(npConstants.keymap.Escape, onEscape);
                var kl2 = npKeyboarder.on(npConstants.keymap.Enter, onEnter);

                var stopListening = inlineEditHelper.startListening(onInlineEditStart);


                /***********/
                /* Cleanup */
                /***********/

                /**
                 * @private
                 * @description Removes the input field and resets variables
                 */
                var destroyInputField = function () {
                    if (inputField) {
                        domRef.style.visibility = '';
                        inputField.remove();
                        inputField = null;
                        scope.inputValue = null;
                        property = null;
                        controlMd = null;
                    }
                };

                /**
                 * @private
                 * @description Unregister events and cleanup
                 */
                scope.$on('$destroy', function cleanup() {
                    npKeyboarder.off(kl1);
                    npKeyboarder.off(kl2);
                    stopListening();
                    destroyInputField();
                });
            }
        };
    }
];

module.exports = npCanvasInlineEdit;
