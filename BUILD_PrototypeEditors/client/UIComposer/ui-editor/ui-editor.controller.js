'use strict';
var _ = require('norman-client-tp').lodash;

module.exports = ['$window', '$scope', '$q', '$state', '$location', '$timeout', 'npPrototype', 'npSnapGuide', 'Studies', 'npBindingHelper', 'npFormFactor', 'npKeyboarder',
    'npConstants', 'npUiCanvasAPI', 'AsideFactory', 'npNavBarHelper', 'uiCommandManager', 'npPageMetadata', 'npMessaging',
    'npConcurrentAccessHelper', 'featureToggle', 'prototypeLock', 'npZoomHelper', 'npLayoutHelper', 'npPageMetadataEvents', 'resPrototype',
    function ($window, $scope, $q, $state, $location, $timeout, npPrototype, npSnapGuide, Studies, npBindingHelper, npFormFactor, npKeyboarder, npConstants,
              npUiCanvasAPI, AsideFactory, npNavBarHelper, uiCommandManager, npPageMetadata, npMessaging, npConcurrentAccessHelper, featureToggle,
              prototypeLock, npZoomHelper, npLayoutHelper, pageMdEvents, resPrototype) {

        var that = this;

        that.currentProject = $state.params.currentProject;
        that.prototypeLocked = !prototypeLock.success;
        npConcurrentAccessHelper.disableUnlockMonitoring();

        npPageMetadata.setCurrentPageName($state.params.currentScreen);
        // default accessmessage for publish proj popup
        var defPubAccessMsg = 'Anyone with this link can access project';

        var init = function () {

            // Show busy indicator
            that.showBusyIndicator = false;
            // Show footer for locked prototype in PreviewMode
            that.showLockedFooter = true;

            // header options
            that.gridVisible = false;
            that.snappingEnabled = true;
            that.rulerHidden = true;
            that.generationVisible = false;

            // Publish prototype snapshot
            that.latestSnapShot = {
                lastPublishedDate: '',
                URL: 'Publish project to create a sharable link',
                publishButtonLabel: '',
                accessMsg: '',

                disablePublishing: false,
                italicizeURLTxt: true
            };

            that.userResearch = {
                studyName: '',
                description: '',
                untitled: 'My Untitled Study'
            };

            that.showInteractiveMode = that.prototypeLocked;
            that.pageTransitionInProgress = false;
            that.rightclickMenu = {
                show: false,
                elements: [],
                styles: {
                    top: 0,
                    left: 0
                },
                selectElement: function () {
                    // implementation in canvas-element-select
                }
            };
            that.canvasFormFactors = npFormFactor.getAvailableFormFactors();
            that.selectedFormFactor = npFormFactor.getCurrentFormFactor();
            that.isSmartApplication = false;
            // FIXME: adding 10px because of inset due to padding, should probably be done in a better way
            that.selectedFormFactor.adjustedWidth = _.parseInt(that.selectedFormFactor.width) + 10 + 'px';

            // TODO:  use promises here, instead of broadcast
            npBindingHelper.initEntities(that.currentProject);

            that.commandManager = uiCommandManager;

            that.prototypeGenerationDisabled = false;
            featureToggle.isEnabled('disable-prototype-generation').then(function (disabled) {
                that.prototypeGenerationDisabled = disabled;
            });
            npPrototype.getPrototype().then(function (prototype) {
                that.isSmartApplication = prototype.isSmartApp;
            });
        };
        init();

        that.setCanvasFormFactor = function (formFactor) {
            npFormFactor.setCurrentFormFactor(formFactor);
            that.selectedFormFactor = formFactor;
            that.selectedFormFactor.adjustedWidth = _.parseInt(that.selectedFormFactor.width) + 10 + 'px';
        };

        // get last published snapshot
        that.getLastPubProj = function () {
            that.latestSnapShot.publishButtonLabel = 'Publish';
            that.latestSnapShot.disablePublishing = false;
            npPageMetadata.flushUpdates().then(function saved() {
                npPrototype.getSnapshot().then(function (snapshot) {
                    if (snapshot.existing) {
                        setLatestSnapShot(snapshot.stats.created_at, snapshot.snapshotUrl, false, defPubAccessMsg);
                    }
                }).catch(function (error) {
                    npMessaging.showError('Error: failed to get last snapshot', error);
                });
            });
        };

        // publish latest snapshot
        that.publishProj = function () {
            that.latestSnapShot.publishButtonLabel = 'Publishing...';
            npPageMetadata.flushUpdates().then(function saved() {
                npPrototype.createSnapshot().then(function (snapshot) {
                    setLatestSnapShot(snapshot.created_at, snapshot.snapshotUrl, false, defPubAccessMsg);
                    $timeout(function () {
                        that.latestSnapShot.publishButtonLabel = 'Published Project';
                        that.latestSnapShot.disablePublishing = true;
                    }, 400);
                }).catch(function (error) {
                    that.latestSnapShot.publishButtonLabel = 'Error!';
                    if (error && error.data && error.data.error && error.data.error.message) {
                        npMessaging.showError('Error: ' + error.data.error.message, error);
                    }
                    else {
                        npMessaging.showError('Error: failed to publish snapshot', error);
                    }
                });
            });
        };

        // set latestSnapShot values
        var setLatestSnapShot = function (pubTimeStamp, url, itURLTxt, accessMsg) {
            // TODO use angular way to display locale time
            that.latestSnapShot.lastPublishedDate = 'last published: ' + new Date(pubTimeStamp).toLocaleString();
            that.latestSnapShot.URL = constructURL(url);
            that.latestSnapShot.italicizeURLTxt = itURLTxt;
            that.latestSnapShot.accessMsg = accessMsg;
        };

        // construct the URL
        var constructURL = function (baseURL) {
            var protocol = $location.protocol(),
                host = $location.host(),
                port = $location.port();
            return protocol + '://' + host + ':' + port + baseURL;
        };

        that.createSnapshotAndStudy = function () {
            if (!that.userResearch.studyName && that.userResearch.studyName.trim().length === 0) {
                that.userResearch.studyName = that.userResearch.untitled;
            }

            npPageMetadata.flushUpdates()
                .then(function saved() {
                    return npPrototype.createSnapshot(false);
                })
                .then(function (snapshot) {
                    var studyData = {
                        projectId: that.currentProject,
                        name: that.userResearch.studyName,
                        description: that.userResearch.description,
                        snapshotVersion: snapshot.snapshotVersion + '', //to pass the snapshot version as a string if not published
                        url: snapshot.deepLinks[0].pageUrl,
                        thumbnailUrl: snapshot.deepLinks[0].thumbnail
                    };
                    return Studies.createStudyWithQuestion(studyData).$promise;
                })
                .then(function (study) {
                    that.dialogClose();
                    navigateTo('shell.project.UserResearch.edit.screens', {
                        currentProject: that.currentProject,
                        studyId: study._id,
                        study: study
                    });
                })
                .catch(function (err) {
                    npMessaging.showError('Error: failed to create study', err);
                });
        };

        var navigateTo = function (stateName, params) {
            $state.go(stateName, params);
        };

        that.dialogOpen = function () {
            npKeyboarder.suspendListeners();
        };

        that.dialogClose = function () {
            npKeyboarder.resumeListeners();
        };

        that.openDataModeler = function () {
            npConcurrentAccessHelper.disableUnlockOnce();
            navigateTo('shell.models', {
                currentProject: that.currentProject
            });
        };

        that.openPageMapView = function () {
            npConcurrentAccessHelper.disableUnlockOnce();
            navigateTo('page-map-view', {
                currentProject: that.currentProject
            });
        };

        var flushAndReload = function () {
            return npPageMetadata.flushUpdates().then(npUiCanvasAPI.reload);
        };

        var forwardKeyEvents = function () {
            forwardKeyEvents.boundListenerFn = npKeyboarder.bindAdditionalWindow(npUiCanvasAPI.getWindow());
        };

        var removeKeyEventForwarding = function () {
            if (typeof forwardKeyEvents.boundListenerFn === 'function') {
                forwardKeyEvents.boundListenerFn();
            }
            delete forwardKeyEvents.boundListenerFn;
        };

        var onCanvasClick = function () {
            $scope.$broadcast('popup-close');
        };

        var forwardClickEvents = function () {
            angular.element(npUiCanvasAPI.getWindow().document).on('click', onCanvasClick);
        };

        var removeClickEventsForwarding = function () {
            angular.element(npUiCanvasAPI.getWindow().document).off('click', onCanvasClick);
        };

        var toggleEscapeBinding = function () {
            if (toggleEscapeBinding.bindingId) {
                npKeyboarder.off(toggleEscapeBinding.bindingId);
                delete toggleEscapeBinding.bindingId;
            }
            else {
                toggleEscapeBinding.bindingId = npKeyboarder.on(npConstants.keymap.Escape, that.toggleInteractiveMode);
            }
        };

        that.toggleNavigationBar = function () {
            if (that.toggleNavigationBar.toggled) {
                AsideFactory.show();
                that.toggleNavigationBar.toggled = false;
            }
            else {
                AsideFactory.hide();
                that.toggleNavigationBar.toggled = true;
            }
        };
        that.toggleNavigationBar.toggled = false;

        that.toggleSideBarRight = function () {
            that.toggleSideBarRight.toggled = !that.toggleSideBarRight.toggled;
        };
        that.toggleSideBarRight.toggled = false;

        that.toggleSideBarLeft = function () {
            that.toggleSideBarLeft.toggled = !that.toggleSideBarLeft.toggled;
        };
        that.toggleSideBarLeft.toggled = false;

        that.hideLockedFooter = function () {
            that.showLockedFooter = false;
        };

        // TODO: Think of a better way to merge enterViewModeInteractiveMode and toggleInteractiveMode
        var enterViewModeInteractiveMode = function () {
            npKeyboarder.suspendListeners([toggleEscapeBinding.bindingId, interactiveModeShortcutMac, interactiveModeShortcutWin]);
            that.showInteractiveMode = true;
            if (!that.toggleNavigationBar.toggled) {
                that.toggleNavigationBar();
            }
            else {
                that.toggleInteractiveMode.navBarWasToggled = true;
            }
        };

        var previewNeedsReload = false;
        $scope.$on('canvasRuntime/loaded', function () {
            previewNeedsReload = false;
        });
        var controlEventsChangedListener = pageMdEvents.listen(pageMdEvents.events.controlEventsChanged, function () {
            previewNeedsReload = true;
        });

        that.toggleInteractiveMode = function () {
            if (!that.showInteractiveMode) {
                that.pageTransitionInProgress = true;
                if (previewNeedsReload) {
                    npMessaging.showBusyIndicator();
                    flushAndReload().then(function () {
                        enterInteractiveMode();
                        npMessaging.hideBusyIndicator();
                    });
                }
                else {
                    enterInteractiveMode();
                }
            }
            else {
                leaveInteractiveMode();
            }
        };

        var enterInteractiveMode = function () {
            forwardKeyEvents();
            forwardClickEvents();
            toggleEscapeBinding();
            npKeyboarder.suspendListeners([toggleEscapeBinding.bindingId, interactiveModeShortcutMac, interactiveModeShortcutWin]);
            that.showInteractiveMode = true;
            if (!that.toggleNavigationBar.toggled) {
                that.toggleNavigationBar();
            }
            else {
                that.toggleInteractiveMode.navBarWasToggled = true;
            }
            that.pageTransitionInProgress = false;
        };

        var leaveInteractiveMode = function () {
            removeKeyEventForwarding();
            removeClickEventsForwarding();
            toggleEscapeBinding();
            npKeyboarder.resumeListeners();
            that.showInteractiveMode = false;
            applyLeaveAnimation();
            if (!that.toggleInteractiveMode.navBarWasToggled) {
                that.toggleNavigationBar();
            }
            delete that.toggleInteractiveMode.navBarWasToggled;
            if (!that.isSmartApplication) {
                npPageMetadata.setCurrentPageName(npUiCanvasAPI.getCurrentViewName());
            }
            $scope.$emit('uiComposer/exitInteractiveMode');
        };

        that.applyLeaveAnimation = false;
        var applyLeaveAnimation = function () {
            that.applyLeaveAnimation = true;
            $timeout(function () {
                that.applyLeaveAnimation = false;
            }, 1100);
        };

        that.snapIconClicked = function () {
            that.snappingEnabled = !that.snappingEnabled;
            npSnapGuide.setSnappingEnabled(that.snappingEnabled);
        };

        // generation dialog choices
        that.choices = [{
            text: 'Master Detail in Read Only',
            value: 'Read'
        }, {
            text: 'Master Detail in Edition',
            value: 'Edit'
        }];

        // generation dialog selected application type
        that.applicationType = {
            selected: 'Read'
        };

        that.runAppFlow = function () {
            that.dialogClose();
            npMessaging.showBusyIndicator();
            npPrototype.createApplication(that.applicationType.selected)
                .then(function () {
                    return $q.all([npPrototype.getPages(), npUiCanvasAPI.reload()]);
                })
                .then(function (values) {
                    var pages = values[0];
                    npPageMetadata.setCurrentPageName(_.first(pages).name);
                })
                .catch(function (error) {
                    npMessaging.showError('Error: failed to create application', error);
                });
        };

        that.returnToPrototypePage = function () {
            navigateTo('shell.project.prototype', {
                currentProject: that.currentProject
            });
        };

        that.dataModelerEnabled = !resPrototype.pages || resPrototype.pages.length === 0 || resPrototype.isSmartApp;

        var getZoomedLength = function (length, zoomLevel) {
            return (parseInt(length, 10) + 50) * zoomLevel + 'px';
        };

        var setCanvasZoomContainerLength = function (currentFormFactor, zoomLevel) {
            that.canvasZoomContainerWidth = getZoomedLength(currentFormFactor.adjustedWidth, zoomLevel);
            that.canvasZoomContainerHeight = getZoomedLength(currentFormFactor.height, zoomLevel);
        };

        $scope.$watch(function () {
                return npZoomHelper.getZoomLevel();
            }, function (newValue) {
                that.zoom = newValue;
                setCanvasZoomContainerLength(that.selectedFormFactor, newValue);
            }
        );

        $scope.$watch(function () {
            return npFormFactor.getCurrentFormFactor();
        }, function (newValue) {
            setCanvasZoomContainerLength(newValue, npZoomHelper.getZoomLevel());
        });

        var firstZoomChanged = true;
        $scope.$on('zoom-changed', function (event, args) {
            npZoomHelper.setZoomLevel(args.value / 100);
            if (firstZoomChanged) {
                $scope.$emit('fit-width');
                firstZoomChanged = false;
            }
        });

        $scope.$on('bindinghelper-model-loaded', function () {
            that.generationVisible = !that.prototypeGenerationDisabled && npBindingHelper.hasEntities();
        });

        /*        // TODO: remove, should be calling page metadata directly
         $scope.$on('propertyChangeUp', function (event, property) {
         event.stopPropagation();
         $scope.$broadcast('propertyChangeDown', property);
         });*/

        $scope.$on('uiCanvas/navigationStart', function () {
            that.pageTransitionInProgress = true;
        });
        $scope.$on('uiCanvas/navigationDone', function () {
            that.pageTransitionInProgress = false;
            if (that.isSmartApplication) {
                // filter the list of controls based on the floorplan type
                $scope.$broadcast('executeCatalogRefresh', npLayoutHelper.getCurrentLayout());
            }

            if (that.prototypeLocked && !that.showInteractiveMode) {
                that.currentAvatar = npPrototype.getPrototypeViewModeData().prototypeViewModeAvatar;
                enterViewModeInteractiveMode();
            }
        });

        $scope.$on('requestLibraryRefresh', function (event) {
            event.stopPropagation();
            $scope.$broadcast('executeLibraryRefresh');
        });

        $scope.$watch(function () {
            return npMessaging.isShowingBusyIndicator();
        }, function () {
            that.showBusyIndicator = npMessaging.isShowingBusyIndicator();
        });

        npNavBarHelper.enableUpdateSaveStatus();

        var interactiveModeShortcutMac = npKeyboarder.on(npConstants.keymap.i, that.toggleInteractiveMode, [npConstants.modifierKeys.Meta], [npConstants.os.MacOS]),
            interactiveModeShortcutWin = npKeyboarder.on(npConstants.keymap.i, that.toggleInteractiveMode, [npConstants.modifierKeys.Control], [npConstants.os.Windows,
                npConstants.os.Linux
            ]);

        var undoRedoListenerIds = [];
        undoRedoListenerIds.push(npKeyboarder.on(npConstants.keymap.z, uiCommandManager.undo, [npConstants.modifierKeys.Meta], [npConstants.os.MacOS]));
        // FIXME this is conflicting with the Chrome shortcut to open the browser history, waiting for PO input
        // undoRedoListenerIds.push(npKeyboarder.on(npConstants.keymap.y, uiCommandManager.redo, [npConstants.modifierKeys.Meta], [npConstants.os.MacOS]));
        undoRedoListenerIds.push(npKeyboarder.on(npConstants.keymap.z, uiCommandManager.redo, [npConstants.modifierKeys.Meta, npConstants.modifierKeys.Shift], [
            npConstants.os.MacOS
        ]));
        undoRedoListenerIds.push(npKeyboarder.on(npConstants.keymap.z, uiCommandManager.undo, [npConstants.modifierKeys.Control], [npConstants.os.Windows,
            npConstants.os.Linux
        ]));
        // FIXME this is conflicting with the Chrome shortcut to open the browser history, waiting for PO input
        // undoRedoListenerIds.push(npKeyboarder.on(npConstants.keymap.y, uiCommandManager.redo, [npConstants.modifierKeys.Control], [npConstants.os.Windows, npConstants.os.Linux]));
        undoRedoListenerIds.push(npKeyboarder.on(npConstants.keymap.z, uiCommandManager.redo, [npConstants.modifierKeys.Control, npConstants.modifierKeys.Shift], [
            npConstants.os.Windows,
            npConstants.os.Linux
        ]));

        $window.addEventListener('beforeunload', npPageMetadata.handleWindowClose);

        $scope.$on('$destroy', function () {
            npKeyboarder.off(interactiveModeShortcutMac);
            npKeyboarder.off(interactiveModeShortcutWin);
            npKeyboarder.off(toggleEscapeBinding.bindingId);
            _.forEach(undoRedoListenerIds, function (listenerId) {
                npKeyboarder.off(listenerId);
            });
            controlEventsChangedListener();
            $window.removeEventListener('beforeunload', npPageMetadata.handleWindowClose);
            if (that.toggleNavigationBar.toggled) {
                that.toggleNavigationBar();
            }
            npNavBarHelper.disableUpdateSaveStatus();
        });
    }
];
