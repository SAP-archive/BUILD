'use strict';


var npPageItem = ['npJsPlumb', '$log', 'npKeyboarder', 'npConstants', 'npPrototype', 'npMessaging', '$timeout',
    function (npJsPlumb, $log, npKeyboarder, npConstants, npPrototype, npMessaging, $timeout) {
        return {
            scope: {
                id: '@',
                item: '=',
                isHome: '@',
                screenName: '@',
                screenImage: '@',
                selectedItem: '='
            },
            templateUrl: 'resources/norman-prototype-editors-client/UIComposer/page-map-view/directives/np-page-item/np-page-item.html',
            restrict: 'E',
            replace: true,
            link: function (scope) {
                var instance = npJsPlumb.instance;

                scope.inputReadOnly = true;
                var oldInputValue = null;
                var inputField = null;
                var isEditing = false;
                var otherPageSelected = true;

                /**
                 * @private
                 * @description Will make the input field editable on double click.
                 */
                scope.onInputDblClick = function (event) {
                    event.stopPropagation();
                    inputField = event.currentTarget;
                    editInputField();
                };

                /**
                 * @private
                 * @description This is to find out if selection has changed.
                 */
                scope.onMouseDown = function () {
                    otherPageSelected = scope.selectedItem.name !== scope.item.name;
                };

                /**
                 * @private
                 * @description Will make the input field editable on single click when page is selected.
                 */
                scope.onInputClick = function (event) {
                    if (!otherPageSelected) {
                        inputField = event.currentTarget;
                        editInputField();
                    }
                    else {
                        event.currentTarget.blur();
                    }
                };

                /**
                 * @private
                 * @description Called when clicking outside of the input field
                 */
                scope.onInputLoseFocus = function () {
                    $timeout(function () {
                        if (document.activeElement !== inputField) {
                            unEditInputField();
                        }
                    }, 100);
                };

                /**
                 * @private
                 * @description Make the input field editable and select text
                 */
                var editInputField = function () {
                    if (isEditing) {
                        return;
                    }
                    isEditing = true;
                    oldInputValue = scope.screenName;
                    inputField.select();
                    scope.inputReadOnly = false;
                    // TODO: this is needed because for some reason blur is not fired on the input field when clicking on a different page; find better way to do this
                    scope.$emit('editPageName', inputField);
                };

                /**
                 * @private
                 * @description Save any changes. Make the input field read-only again.
                 */
                var unEditInputField = function () {
                    if (!isEditing) {
                        return;
                    }
                    if (scope.screenName === '') {
                        scope.screenName = oldInputValue;
                    }
                    if (scope.screenName !== oldInputValue) {
                        npPrototype.setPageDisplayName(scope.item.name, scope.screenName)
                            .catch(function (error) {
                                npMessaging.showError('Error: failed to rename the page', error);
                            });
                    }
                    inputField.selectionEnd = inputField.selectionStart;
                    isEditing = false;
                    scope.inputReadOnly = true;
                    oldInputValue = null;
                    inputField = null;
                };

                /**
                 * @private
                 * @description Revert changes on escape.
                 */
                var onEscape = function () {
                    if (!isEditing) {
                        return;
                    }
                    scope.screenName = oldInputValue;
                    inputField.blur();
                };

                /**
                 * @private
                 * @description Save changes on enter.
                 */
                var onEnter = function () {
                    if (!isEditing) {
                        return;
                    }
                    inputField.blur();
                };

                var kl1 = npKeyboarder.on(npConstants.keymap.Escape, onEscape);
                var kl2 = npKeyboarder.on(npConstants.keymap.Enter, onEnter);

                /**
                 * @private
                 * @description Cleanup
                 */
                scope.$on('$destroy', function () {
                    cleanup();
                });

                /**
                 * @private
                 * @description Cleanup
                 */
                var cleanup = function () {
                    npKeyboarder.off(kl1);
                    npKeyboarder.off(kl2);
                    instance.repaintEverything();
                };
            }
        };
    }
];

module.exports = npPageItem;

