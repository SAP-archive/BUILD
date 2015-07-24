'use strict';
(function () {

    var expect = chai.expect,
        _ = window._;

    describe('Service: np-canvas-updater:', function () {
        var canvasUpdater, $q, $rootScope,
            npUiCanvasAPIMock, npPageMetadataEventsMock, npCanvasEventsMock, npPageMetadataHelperMock,
            createControlMdObj;

        beforeEach(module('uiComposer.uiCanvas'));

        beforeEach(function () {
            npUiCanvasAPIMock = {
                navTo: function () {
                    return $q.when();
                },
                addChildByMd: sinon.stub(),
                deleteControl: sinon.stub(),
                moveChildByMd: sinon.stub(),
                setControlPropertiesByMd: sinon.stub(),
                bindControlGroupByMd: sinon.stub(),
                controlReady: sinon.stub()
            };

            npPageMetadataEventsMock = {
                _listeners: [],
                _unsubscribeFn: sinon.stub(),
                events: {
                    controlsAdded: 'controlsAdded',
                    controlsRemoved: 'controlsRemoved',
                    controlsMoved: 'controlsMoved',
                    controlPropertiesChanged: 'controlPropertiesChanged',
                    controlsBindingChanged: 'controlsBindingChanged',
                    mainEntityChanged: 'mainEntityChanged'
                },
                listen: function (eventName, cb) {
                    this._listeners.push({
                        eventName: eventName,
                        cb: cb
                    });
                    return this._unsubscribeFn;
                },
                _trigger: function (eventName, args) {
                    _.forEach(this._listeners, function (l) {
                        if (l.eventName === eventName) {
                            l.cb.apply(undefined, args);
                        }
                    });
                }
            };

            npCanvasEventsMock = {
                events: {
                    controlsRendered: 'controlsRendered'
                },
                broadcast: sinon.stub()
            };

            npPageMetadataHelperMock = {
                _controls: [],
                getControlMd: function (id) {
                    return _.find(this._controls, {
                        controlId: id
                    });
                },
                isBound: function () {
                    return true;
                }
            };

            // factory function to create mocked controlMd objects
            createControlMdObj = function (controlId, parent, parentGroupId) {
                var control = {
                    controlId: controlId,
                    groups: [],
                    getChildrenMd: function (groupId) {
                        return _.find(this.groups, {
                            groupId: groupId
                        }).children;
                    },
                    getParentMd: sinon.stub()
                };

                if (parent) {
                    var parentGroup = _.find(parent.groups, {
                        groupId: parentGroupId
                    });
                    if (parentGroup) {
                        parentGroup.children.push(control);
                    }
                    else {
                        parent.groups.push({
                            groupId: parentGroupId,
                            children: [control]
                        });
                    }
                    control.getParentMd = function () {
                        return parent;
                    };
                }
                npPageMetadataHelperMock._controls.push(control);
                return control;
            };


            module(function ($provide) {
                $provide.value('npUiCanvasAPI', npUiCanvasAPIMock);
                $provide.value('npPageMetadataEvents', npPageMetadataEventsMock);
                $provide.value('npCanvasEvents', npCanvasEventsMock);
                $provide.value('npPageMetadataHelper', npPageMetadataHelperMock);
            });

            inject(function ($injector) {
                canvasUpdater = $injector.get('npCanvasUpdater');
                $q = $injector.get('$q');
                $rootScope = $injector.get('$rootScope');
            });
        });

        var verifyEventRegistration = function (eventName) {
            var spy = sinon.spy(npPageMetadataEventsMock, 'listen');
            canvasUpdater.startListeningForMetadataChanges();
            expect(spy.calledWith(eventName)).to.be.ok;
        };

        var verifyNav = function (triggerEvent) {
            canvasUpdater.startListeningForMetadataChanges();
            var navSpy = sinon.spy(npUiCanvasAPIMock, 'navTo'),
                evt = {},
                pageMd = {},
                changedControls = [createControlMdObj('button')];
            npPageMetadataEventsMock._trigger(triggerEvent, [evt, pageMd, changedControls]);
            $rootScope.$apply();
            expect(navSpy.calledWith(pageMd)).to.be.ok;
            return {
                navSpy: navSpy,
                changedControl: changedControls[0]
            };
        };

        var verifyReady = function (triggerEvent, canvasFn, waitForParent) {
            var deferred = $q.defer();
            npUiCanvasAPIMock.controlReady = function () {
                return deferred.promise;
            };
            canvasUpdater.startListeningForMetadataChanges();
            var pageCtrl = createControlMdObj('page'),
                button = createControlMdObj('button', pageCtrl, 'content'),
                evt = {},
                pageMd = {},
                changedControls = [button];
            npPageMetadataEventsMock._trigger(triggerEvent, [evt, pageMd, changedControls]);
            $rootScope.$apply();
            expect(npUiCanvasAPIMock[canvasFn].calledWith(button)).to.be.ok;
            expect(npCanvasEventsMock.broadcast.called).to.not.be.ok;
            deferred.resolve();
            $rootScope.$apply();
            if (!waitForParent) {
                expect(npCanvasEventsMock.broadcast.calledWith('controlsRendered', changedControls)).to.be.ok;
            }
            else {
                expect(npCanvasEventsMock.broadcast.calledWith('controlsRendered', [pageCtrl])).to.be.ok;
            }
        };

        it('should unregister all listeners when stop listening is called', function () {
            var registerSpy = sinon.spy(npPageMetadataEventsMock, 'listen'),
                unsubscribeSpy = npPageMetadataEventsMock._unsubscribeFn;
            canvasUpdater.startListeningForMetadataChanges();
            canvasUpdater.stopListeningForMetadataChanges();

            expect(registerSpy.callCount).to.be.equal(unsubscribeSpy.callCount);
        });

        describe('adding controls:', function () {
            it('should register a listener for the controlsAdded event', function () {
                verifyEventRegistration('controlsAdded');
            });

            it('should navigate to the apropriate page before adding controls to the canvas when it receives the controls added event', function () {
                var nav = verifyNav('controlsAdded');
                expect(npUiCanvasAPIMock.addChildByMd.calledAfter(nav.navSpy)).to.be.ok;
                expect(npUiCanvasAPIMock.addChildByMd.calledWith(nav.changedControl)).to.be.ok;
            });

            it('should add all added controls and their children from all groups to the canvas', function () {
                canvasUpdater.startListeningForMetadataChanges();
                var list = createControlMdObj('list'),
                    listItem = createControlMdObj('listItem', list, 'items'),
                    itemAttribute = createControlMdObj('itemAttribute', listItem, 'attributes'),
                    header = createControlMdObj('header', list, 'header'),
                    button = createControlMdObj('button');
                var evt = {},
                    pageMd = {},
                    addedControls = [list, button];
                npPageMetadataEventsMock._trigger('controlsAdded', [evt, pageMd, addedControls]);
                $rootScope.$apply();
                expect(npUiCanvasAPIMock.addChildByMd.calledWith(list)).to.be.ok;
                expect(npUiCanvasAPIMock.addChildByMd.calledWith(listItem)).to.be.ok;
                expect(npUiCanvasAPIMock.addChildByMd.calledWith(itemAttribute)).to.be.ok;
                expect(npUiCanvasAPIMock.addChildByMd.calledWith(header)).to.be.ok;
                expect(npUiCanvasAPIMock.addChildByMd.calledWith(button)).to.be.ok;
            });

            it('should broadcast the controls ready event once all controls have been added and are ready', function () {
                verifyReady('controlsAdded', 'addChildByMd');
            });
        });

        describe('removing controls:', function () {
            it('should register a listener for the controlsRemoved event', function () {
                verifyEventRegistration('controlsRemoved');
            });

            it('should navigate to the apropriate page before removing controls from the canvas when it receives the controls removed event',
                function () {
                    var nav = verifyNav('controlsRemoved');
                    expect(npUiCanvasAPIMock.deleteControl.calledAfter(nav.navSpy)).to.be.ok;
                    expect(npUiCanvasAPIMock.deleteControl.calledWith(nav.changedControl)).to.be.ok;
                });

            it('should broadcast the controls ready event once all controls have been deleted and their parents are ready', function () {
                verifyReady('controlsRemoved', 'deleteControl', true);
            });
        });

        describe('moving controls:', function () {
            it('should register a listener for the controlsMoved event', function () {
                verifyEventRegistration('controlsMoved');
            });

            it('should navigate to the apropriate page before moving controls on the canvas when it receives the controls moved event', function () {
                var nav = verifyNav('controlsMoved');
                expect(npUiCanvasAPIMock.moveChildByMd.calledAfter(nav.navSpy)).to.be.ok;
                expect(npUiCanvasAPIMock.moveChildByMd.calledWith(nav.changedControl)).to.be.ok;
            });

            it('should broadcast the controls ready event once all controls have been moved and are ready', function () {
                verifyReady('controlsMoved', 'moveChildByMd');
            });
        });

        describe('changing properties:', function () {
            it('should register a listener for the controlPropertiesChanged event', function () {
                verifyEventRegistration('controlPropertiesChanged');
            });

            it('should navigate to the apropriate page before changing properties', function () {
                canvasUpdater.startListeningForMetadataChanges();
                var navSpy = sinon.spy(npUiCanvasAPIMock, 'navTo'),
                    evt = {},
                    pageMd = {},
                    buttonCtrl = createControlMdObj('button'),
                    propertyChange = {
                        propertyType: 'properties',
                        controlMd: buttonCtrl,
                        properties: []
                    };
                npPageMetadataEventsMock._trigger('controlPropertiesChanged', [evt, pageMd, [propertyChange]]);
                $rootScope.$apply();
                expect(navSpy.calledWith(pageMd)).to.be.ok;
                expect(npUiCanvasAPIMock.setControlPropertiesByMd.calledAfter(navSpy)).to.be.ok;
                expect(npUiCanvasAPIMock.setControlPropertiesByMd.calledWith(propertyChange.controlMd, propertyChange.properties)).to.be.ok;
            });

            it('should not set properties if they are of a property type other then \'properties\' (e.g. design properties)', function () {
                canvasUpdater.startListeningForMetadataChanges();
                var evt = {},
                    pageMd = {},
                    buttonCtrl = createControlMdObj('button'),
                    propertyChange = {
                        propertyType: 'designProperties',
                        controlMd: buttonCtrl,
                        properties: []
                    };
                npPageMetadataEventsMock._trigger('controlPropertiesChanged', [evt, pageMd, [propertyChange]]);
                $rootScope.$apply();
                expect(npUiCanvasAPIMock.setControlPropertiesByMd.called).not.to.be.ok;
            });

            it('should broadcast the controls ready event once all control properties have been changed and the controls are ready', function () {
                var deferred = $q.defer();
                npUiCanvasAPIMock.controlReady = function () {
                    return deferred.promise;
                };
                canvasUpdater.startListeningForMetadataChanges();
                var button = createControlMdObj('button'),
                    evt = {},
                    pageMd = {},
                    propertyChange = {
                        propertyType: 'properties',
                        controlMd: button,
                        properties: []
                    };
                npPageMetadataEventsMock._trigger('controlPropertiesChanged', [evt, pageMd, [propertyChange]]);
                $rootScope.$apply();
                expect(npUiCanvasAPIMock.setControlPropertiesByMd.called).to.be.ok;
                expect(npCanvasEventsMock.broadcast.called).to.not.be.ok;
                deferred.resolve();
                $rootScope.$apply();
                expect(npCanvasEventsMock.broadcast.calledWith('controlsRendered', [button])).to.be.ok;
            });
        });

        describe('changing bindings:', function () {
            it('should register a listener for the controlsBindingChanged event', function () {
                verifyEventRegistration('controlsBindingChanged');
            });

            it('should navigate to the apropriate page before changing bindings', function () {
                canvasUpdater.startListeningForMetadataChanges();
                var navSpy = sinon.spy(npUiCanvasAPIMock, 'navTo'),
                    evt = {},
                    pageMd = {},
                    listCtrl = createControlMdObj('list'),
                    listItemCtrl = createControlMdObj('listItem'),
                    itemsGroup = {
                        children: ['listItem']
                    },
                    bindingDef = {
                        controlId: 'list',
                        groupId: 'items'
                    };
                npPageMetadataHelperMock.getGroupMd = function () {
                    return itemsGroup;
                };
                npPageMetadataEventsMock._trigger('controlsBindingChanged', [evt, pageMd, [bindingDef]]);
                $rootScope.$apply();
                expect(navSpy.calledWith(pageMd)).to.be.ok;
                expect(npUiCanvasAPIMock.bindControlGroupByMd.calledAfter(navSpy)).to.be.ok;
                expect(npUiCanvasAPIMock.bindControlGroupByMd.calledWith(listCtrl, itemsGroup, listItemCtrl)).to.be.ok;
            });

            it('should add all previous children back if change binding unbinds the control group', function () {
                canvasUpdater.startListeningForMetadataChanges();
                var evt = {},
                    pageMd = {},
                    listCtrl = createControlMdObj('list'),
                    listItemCtrl = createControlMdObj('listItem'),
                    itemsGroup = {
                        children: ['listItem']
                    },
                    bindingDef = {
                        controlId: 'list',
                        groupId: 'items',
                        children: [{}, {}]
                    };
                npPageMetadataHelperMock.getGroupMd = function () {
                    return itemsGroup;
                };
                npPageMetadataHelperMock.isBound = function () {
                    return false;
                };
                npPageMetadataEventsMock._trigger('controlsBindingChanged', [evt, pageMd, [bindingDef]]);
                $rootScope.$apply();
                expect(npUiCanvasAPIMock.bindControlGroupByMd.calledWith(listCtrl, itemsGroup, listItemCtrl)).to.be.ok;
                expect(npUiCanvasAPIMock.addChildByMd.callCount).to.be.equal(bindingDef.children.length);
            });
        });

        describe('changing main entity:', function () {
            it('should register a listener for the mainEntityChanged event', function () {
                verifyEventRegistration('mainEntityChanged');
            });

            it('should navigate to the page who\'s main entity was changed and broadcast the ready event when the page control is ready', function () {
                var deferred = $q.defer(),
                    navSpy = sinon.spy(npUiCanvasAPIMock, 'navTo'),
                    evt = {},
                    pageMd = {
                        rootControlId: 'pageCtrl'
                    },
                    pageCtrl = createControlMdObj('pageCtrl');
                npUiCanvasAPIMock.controlReady = function () {
                    return deferred.promise;
                };
                canvasUpdater.startListeningForMetadataChanges();
                npPageMetadataEventsMock._trigger('mainEntityChanged', [evt, pageMd]);
                $rootScope.$apply();
                expect(navSpy.calledWith(pageMd)).to.be.ok;
                expect(npCanvasEventsMock.broadcast.called).to.not.be.ok;
                deferred.resolve();
                $rootScope.$apply();
                expect(npCanvasEventsMock.broadcast.calledWith('controlsRendered', [pageCtrl])).to.be.ok;

            });
        });
    });
})();
