'use strict';

var _ = require('norman-client-tp').lodash;

module.exports = ['$scope', '$log', '$state', '$q', '$timeout', 'npPrototype', 'npJsPlumb', 'npKeyboarder', 'npConstants', 'npPageMapLayout', 'npNavBarHelper', 'npMessaging', 'npConcurrentAccessHelper', 'npUiCatalog', 'npBindingHelper',
    function ($scope, $log, $state, $q, $timeout, npPrototype, npJsPlumb, npKeyboarder, npConstants, npPageMapLayout, npNavBarHelper, npMessaging, npConcurrentAccessHelper, npUiCatalog, npBindingHelper) {
        var that = this;
        var inputEditField = null;
        npConcurrentAccessHelper.enableUnlockMonitoring();

        var availableFloorplans;
        var init = function () {
            that.selectedPage = {};
            that.artifactBaseUrl = npPrototype.getArtifactBaseUrl();
            npJsPlumb.reset();
            $q.all([npUiCatalog.getFloorplans(), npPrototype.getPrototype(), npBindingHelper.queryModel($state.params.currentProject)])
                .then(function (res) {
                    var prototype = res[1],
                        dataModel = res[2];
                    that.currentPageCount = prototype.pages.length;
                    availableFloorplans = res[0];
                    var hasEntities = dataModel.entities && dataModel.entities.length;
                    setupStartingFloorplans(availableFloorplans, hasEntities);
                    var values = npPageMapLayout.applyFirstOccurenceRuleOnLinks(prototype.pages, prototype.navigations, prototype.isSmartApp);
                    setLayoutPages(values);
                    that.unconnected = npPageMapLayout.getGridLayout(values.unConnectedPages);

                })
                .catch(function (error) {
                    npMessaging.showError('Error: retrieving prototype failed', error);
                });

            npJsPlumb.init();
        };

        init();

        /**
         * Note: for beta 2 only these two are supported as first pages of a prototype
         */
        var setupStartingFloorplans = function (floorplans, hasEntities) {
            var validStartingFloorplans = ['ListReport'];
            if (!hasEntities) {
                validStartingFloorplans.push('ABSOLUTE');
            }
            that.startingFloorplans = _.filter(floorplans, function (fp) {
                return _.contains(validStartingFloorplans, fp.floorplan);
            });
            addMissingFloorplanInformation(that.startingFloorplans);
        };

        var addMissingFloorplanInformation = function (floorplans) {
            var additionalFpInfo = {
                ABSOLUTE: {
                    iconClass: 'image-page',
                    description: 'A blank page is ideal for freestyle designing your prototype.'
                },
                ListReport: {
                    text: 'ListReport Smart Template',
                    iconClass: 'image-list',
                    description: 'Start with a Report template and jumpstart your design.'
                }
            };
            _.forEach(floorplans, function (floorplan) {
                _.extend(floorplan, additionalFpInfo[floorplan.floorplan]);
            });
        };

        that.createPage = function (selectedPageType) {
            var promise = $q.when();
            if (!selectedPageType) {
                promise = npPrototype.getPrototype()
                    .then(function (prototype) {
                        if (prototype.isSmartApp) {
                            selectedPageType = _.find(availableFloorplans, {floorplan: 'ObjectPage'});
                        }
                        else {
                            selectedPageType = _.find(availableFloorplans, {floorplan: 'ABSOLUTE'});
                        }
                    });
            }
            // Once support for display name is added send name that user chose to backend
            promise
                .then(function () {
                    return npPrototype.createPages(1, selectedPageType);
                })
                .then(function (res) {
                    var values = npPageMapLayout.applyFirstOccurenceRuleOnLinks(res.pages, res.navigations);
                    that.unconnected = npPageMapLayout.getGridLayout(values.unConnectedPages);
                    // Smart template pages will have connections set up on creation of Object Page,
                    // hence we need to reset the connected pages as well
                    setLayoutPages(values);
                    that.currentPageCount++;
                })
                .catch(function (error) {
                    npMessaging.showError('Error: creating new page failed', error);
                });
        };

        var setLayoutPages = function (values) {
            that.connectedScreens = npPageMapLayout.createLayout(values.connectedPages, values.edges);
            that.connections = values.edges;
        };

        that.deletePage = function () {
            if (_.isEmpty(that.selectedPage)) {
                return;
            }
            var pageToDelete = that.selectedPage;
            npPrototype.deletePage(pageToDelete.name).then(function (res) {
                var pageValues = npPageMapLayout.applyFirstOccurenceRuleOnLinks(res.pages, res.navigations);
                // If Home screen is changed on deletion, it needs to be reflected if home is in connected pages or vice versa
                that.connectedScreens = npPageMapLayout.createLayout(pageValues.connectedPages, pageValues.edges);
                that.unconnected = npPageMapLayout.getGridLayout(pageValues.unConnectedPages);
                that.currentPageCount--;
                if (pageToDelete.isConnected) {
                    npJsPlumb.reset();
                    npJsPlumb.init();
                    that.connections = pageValues.edges;
                }
            }, function (error) {
                npMessaging.showError('Error: failed to delete page', error);
            });
            that.selectedPage = {};
        };

        var deletePageConfirm = function () {
            if (_.isEmpty(that.selectedPage)) {
                return;
            }
            npPrototype.getPrototype()
                .then(function (proto) {
                    if (proto.isSmartApp && that.selectedPage.name === proto.pages[0].name) {
                        npMessaging.showError('Error: ListReport page of a smart template application cannot be deleted.');
                    }
                    else {
                        $scope.$broadcast('dialog-open', 'delete-confirm-dialog');
                    }
                });
        };

        that.goToComposerPage = function (pageName) {
            npConcurrentAccessHelper.disableUnlockOnce();
            $state.go('ui-composer', {
                currentProject: $state.params.currentProject,
                currentScreen: pageName
            });
        };

        that.selectPage = function (page) {
            // TODO: this is needed because for some reason blur is not fired on the input field when clicking on a different page; find better way to do this
            if (inputEditField) {
                inputEditField.blur();
                inputEditField = null;
            }
            that.selectedPage = page;
        };

        npNavBarHelper.enableUpdateSaveStatus();

        var l1 = npKeyboarder.on(npConstants.keymap.Delete, deletePageConfirm);
        var l2 = npKeyboarder.on(npConstants.keymap.Backspace, deletePageConfirm);

        $scope.$on('$destroy', function () {
            npKeyboarder.off(l1);
            npKeyboarder.off(l2);
            npNavBarHelper.disableUpdateSaveStatus();
        });

        // TODO: this is needed because for some reason blur is not fired on the input field when clicking on a different page; find better way to do this
        $scope.$on('editPageName', function (event, inputField) {
            event.stopPropagation();
            inputEditField = inputField;
        });

    }];
