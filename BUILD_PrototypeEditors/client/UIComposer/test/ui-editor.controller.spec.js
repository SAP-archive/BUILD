'use strict';
(function () {

    var expect = chai.expect,
        _ = window._;

    describe('Controller: ui-editor', function () {
        var disablePrototypeGeneration, featureToggleMock, createController, scope, $httpBackend, $rootScope, npFormFactor, npPrototypeMock, $q, npPageMetadataMock,
            stateMock, npSnapGuideMock, npMessagingMock, studiesMock, npBindingHelperMock, npKeyboarderMock, npUiCanvasAPIMock, AsideFactoryMock, npNavBarHelperMock,
            prototypeLockMock, uiCommandManagerMock, npLayoutHelperMock, npPageMetadataEventsMock, resPrototypeMock;

        disablePrototypeGeneration = true;

        featureToggleMock = {
            isEnabled: function () {
                return $q.when(disablePrototypeGeneration);
            }
        };

        stateMock = {
            params: {
                currentProject: 123,
                currentScreen: 'S1'
            }
        };
        npSnapGuideMock = {};
        npMessagingMock = {
            showError: function () {
            },
            isShowingBusyIndicator: function () {
            },
            showBusyIndicator: function () {
            },
            hideBusyIndicator: function () {
            }
        };
        npPrototypeMock = {
            getSnapshot: function () {
                return $q.when({});
            },
            createSnapshot: function () {
                return $q.when({});
            },
            lockPrototype: function () {
                return $q.when({});
            },
            unlockPrototype: function () {
            },
            createApplication: function () {
                return $q.when({});
            },
            getPrototypeViewModeData: function () {
            },
            getPrototype: function () {
                return $q.when({});
            }
        };
        npPageMetadataMock = {
            flushUpdates: function () {
                return $q.when({});
            },
            setCurrentPageName: sinon.stub()
        };
        studiesMock = {};
        npBindingHelperMock = {
            initEntities: function () {
            }
        };
        npKeyboarderMock = {
            on: function () {
            },
            off: function () {
            },
            bindAdditionalWindow: function () {
                return this._listenerFn;
            },
            suspendListeners: sinon.stub(),
            resumeListeners: sinon.stub(),
            _listenerFn: function () {
            }
        };
        npUiCanvasAPIMock = {
            reload: function () {
                return $q.when();
            },
            getWindow: function () {
                return this._window;
            },
            _window: {},
            getCurrentViewName: function () {
                return 'S0';
            }
        };
        npLayoutHelperMock = {
            getCurrentFloorplan: function () {
                return 'ABSOLUTE';
            }
        };

        AsideFactoryMock = {
            show: sinon.stub(),
            hide: sinon.stub()
        };

        npNavBarHelperMock = {
            enableUpdateSaveStatus: sinon.stub(),
            disableUpdateSaveStatus: sinon.stub()
        };

        prototypeLockMock = {success: true};

        var npConcurrentAccessHelperMock = {
            disableUnlockMonitoring: sinon.stub(),
            disableUnlockOnce: sinon.stub()
        };

        uiCommandManagerMock = {};

        npPageMetadataEventsMock = {
            events: {
                controlEventsChanged: 'controlEventsChanged'
            },
            _listeners: [],
            listen: function (event, cb) {
                this._listeners.push({
                    event: event,
                    cb: cb
                });
                return sinon.stub();
            },
            _trigger: function (event) {
                _.forEach(this._listeners, function (l) {
                    if (l.event === event) {
                        l.cb();
                    }
                });
            }
        };

        resPrototypeMock = sinon.stub();

        beforeEach(module(function ($provide) {
            $provide.value('ActiveProjectService', {
                id: stateMock.params.currentProject,
                name: stateMock.params.currentProject
            });
            $provide.value('$stateParams', stateMock.params);
        }));

        beforeEach(module('ngResource'));
        beforeEach(module('uiComposer.services'));
        beforeEach(module('uiComposer.uiEditor'));

        beforeEach(inject(function ($injector, $controller) {

            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            npFormFactor = $injector.get('npFormFactor');
            $q = $injector.get('$q');

            $httpBackend.when('GET', '/api/projects/123/prototype').respond({});
            $httpBackend.when('POST', '/api/projects/123/prototype/lock').respond({success: true});

            createController = function () {
                scope = $rootScope.$new();
                return $controller('UiEditorCtrl', {
                    $scope: scope,
                    $state: stateMock,
                    npSnapGuide: npSnapGuideMock,
                    npPrototype: npPrototypeMock,
                    npMessaging: npMessagingMock,
                    Studies: studiesMock,
                    npBindingHelper: npBindingHelperMock,
                    npKeyboarder: npKeyboarderMock,
                    npUiCanvasAPI: npUiCanvasAPIMock,
                    AsideFactory: AsideFactoryMock,
                    npNavBarHelper: npNavBarHelperMock,
                    npPageMetadata: npPageMetadataMock,
                    prototypeLock: prototypeLockMock,
                    npConcurrentAccessHelper: npConcurrentAccessHelperMock,
                    uiCommandManager: uiCommandManagerMock,
                    featureToggle: featureToggleMock,
                    npLayoutHelper: npLayoutHelperMock,
                    npPageMetadataEvents: npPageMetadataEventsMock,
                    resPrototype: resPrototypeMock
                });
            };
        }));

        it('should hide the grid by default', function () {
            var ctrl = createController();
            expect(ctrl.gridVisible).to.be.equal(false);
        });

        it('should hide the ruler by default', function () {
            var ctrl = createController();
            expect(ctrl.rulerHidden).to.be.equal(true);
        });


        it('should have a form factor set by default', function () {
            var ctrl = createController();
            expect(ctrl.selectedFormFactor).to.be.an('object');
        });

        it('should update the form factor on change', function () {
            var ctrl = createController(),
                spy = sinon.spy(npFormFactor, 'setCurrentFormFactor');

            var tabletSized = {
                name: 'Tablet',
                type: 'tablet',
                icon: 'resources/norman-prototype-editors-client/UIComposer/assets/images/devices/ipad.svg'
            };

            ctrl.setCanvasFormFactor(tabletSized);
            expect(ctrl.selectedFormFactor).to.be.equal(tabletSized);
            expect(spy.calledWith(tabletSized)).to.be.ok;
        });

        it('should default to untiled study name if no study name is entered', function () {
            var ctrl = createController();
            ctrl.userResearch.studyName = '';
            ctrl.createSnapshotAndStudy();
            expect(ctrl.userResearch.studyName).to.be.equal('My Untitled Study');
        });

        describe('interactive mode:', function () {
            it('should not show interactive mode by default', function () {
                var ctrl = createController();
                expect(ctrl.showInteractiveMode).to.be.equal(false);
            });

            it('should flush pending updates, reload the canvas, forward key events from the iframe and toggle the navigation bar when entering interactive mode', function () {
                var ctrl = createController(),
                    flushSpy = sinon.spy(npPageMetadataMock, 'flushUpdates'),
                    reloadSpy = sinon.spy(npUiCanvasAPIMock, 'reload'),
                    keyboarderSpy = sinon.spy(npKeyboarderMock, 'bindAdditionalWindow');
                npPageMetadataEventsMock._trigger('controlEventsChanged');
                ctrl.toggleInteractiveMode();
                scope.$apply();
                expect(ctrl.showInteractiveMode).to.be.equal(true);
                expect(flushSpy.called).to.be.ok;
                expect(reloadSpy.called).to.be.ok;
                expect(keyboarderSpy.calledWith(npUiCanvasAPIMock._window)).to.be.ok;
                expect(ctrl.toggleNavigationBar.toggled).to.be.equal(true);
                npPageMetadataMock.flushUpdates.restore();
                npUiCanvasAPIMock.reload.restore();
                npKeyboarderMock.bindAdditionalWindow.restore();
            });

            it('should not flush updates and reload the canvas if the canvas has not been invalidated by modifying a controls action', function () {
                var ctrl = createController(),
                    flushSpy = sinon.spy(npPageMetadataMock, 'flushUpdates'),
                    reloadSpy = sinon.spy(npUiCanvasAPIMock, 'reload');
                ctrl.toggleInteractiveMode();
                scope.$apply();
                expect(ctrl.showInteractiveMode).to.be.equal(true);
                expect(flushSpy.called).to.not.be.ok;
                expect(reloadSpy.called).to.not.be.ok;
                npPageMetadataMock.flushUpdates.restore();
                npUiCanvasAPIMock.reload.restore();
            });

            it('should remove the key event forwarding and show the navigation bar when exiting interactive mode', function () {
                var ctrl = createController(),
                    keyboarderSpy = sinon.spy(npKeyboarderMock, '_listenerFn');
                ctrl.toggleInteractiveMode();
                scope.$apply();
                ctrl.toggleInteractiveMode();
                scope.$apply();
                expect(ctrl.showInteractiveMode).to.be.equal(false);
                expect(ctrl.toggleNavigationBar.toggled).to.be.equal(false);
                expect(keyboarderSpy.called).to.be.ok;
            });
        });
    });
})();
