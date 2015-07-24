'use strict';

var npUiTreeModify = ['$state', 'npKeyboarder', 'npConstants', 'npPrototype', 'npMessaging', 'npPageMetadata',
    function ($state, npKeyboarder, npConstants, npPrototype, npMessaging, npPageMetadata) {
        return {
            restrict: 'E',
            scope: {
                item: '=',
                nodeslength: '@'
            },
            templateUrl: 'resources/norman-prototype-editors-client/UIComposer/ui-editor/tree-panel/directives/np-ui-tree-modify/np-ui-tree-modify.html',
            link: function (scope, element) {
                scope.editing = false;

                var inputElement = element[0].getElementsByClassName('np-e-tree-handle-page-input-js')[0];

                scope.deletePageOnTree = function () {
                    scope.$broadcast('dialog-open', 'np-e-tree-handle-confMessage');
                };

                scope.delete = function (item) {
                    npPrototype.deletePage(item.pageName)
                        .then(function (result) {
                            if (result.pages.length) {
                                npPageMetadata.setCurrentPageName(item.nextPageToBeSelected);
                            }
                            else {
                                $state.go('page-map-view', {
                                    currentProject: $state.params.currentProject
                                });
                            }
                        })
                        .catch(function (error) {
                            npMessaging.showError('Error: failed to delete page', error);
                        });
                };

                scope.editPageOnTree = function () {
                    inputElement.readOnly = false;
                    inputElement.select();
                    scope.editing = true;
                };

                scope.saveDisplayName = function () {
                    if (!scope.editing) {
                        return;
                    }
                    var inputValue = inputElement.value.trim();
                    if (inputValue.length > 0) {
                        npPrototype.setPageDisplayName(scope.item.pageName, inputValue)
                            .catch(function (error) {
                                npMessaging.showError('Error: failed to rename the page', error);
                            }).finally(exitEditMode);
                    }
                    else {
                        exitEditMode();
                    }
                };

                var exitEditMode = function () {
                    if (!scope.editing) {
                        return;
                    }
                    scope.editing = false;
                    inputElement.readOnly = true;
                    setDisplayName();
                };

                var setDisplayName = function () {
                    npPrototype.getPageDisplayName(scope.item.pageName).then(function (displayName) {
                        inputElement.value = scope.item.displayName = displayName;
                    });
                };

                var kl1 = npKeyboarder.on(npConstants.keymap.Enter, scope.saveDisplayName);
                var kl2 = npKeyboarder.on(npConstants.keymap.Escape, exitEditMode);

                scope.$on('displayNameChanged', function () {
                    setDisplayName();
                });

                scope.$on('$destroy', function cleanup() {
                    npKeyboarder.off(kl1);
                    npKeyboarder.off(kl2);
                });

            }
        };
    }];
module.exports = npUiTreeModify;
