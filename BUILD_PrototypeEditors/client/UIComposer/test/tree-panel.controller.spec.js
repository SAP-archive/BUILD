'use strict';
(function () {

    var expect = chai.expect,
        _ = window._;

    describe('Controller: tree-panel', function () {
        var createCtrl, scope, $q,
            npPrototypeMock, npUiCanvasAPIMock, npTreeModelMock, npTreeSelectMock, npPageMetadataMock, npMessagingMock, npConstantsMock, npKeyboarderMock;

        beforeEach(module('uiComposer.uiEditor.treePanel'));

        beforeEach(function () {
            npPrototypeMock = {
                _pages: [{
                    name: 'page1'
                }, {
                    name: 'page2'
                }],
                getPages: function () {
                    return $q.when(npPrototypeMock._pages);
                },
                createPages: sinon.stub()
            };

            npUiCanvasAPIMock = {
                reload: sinon.stub()
            };

            npTreeModelMock = {
                refreshModel: function () {
                    return $q.when([]);
                }
            };

            npTreeSelectMock = {
                selectPreviousNode: sinon.stub(),
                selectNextNode: sinon.stub()
            };

            npPageMetadataMock = {
                flushUpdates: function () {
                    return $q.when();
                },
                setCurrentPageName: sinon.stub()
            };

            npMessagingMock = {
                showBusyIndicator: sinon.stub(),
                showError: sinon.stub()
            };

            npConstantsMock = {
                keymap: {
                    ArrowUp: 'ArrowUp',
                    ArrowDown: 'ArrowDown',
                    ArrowLeft: 'ArrowLeft',
                    ArrowRight: 'ArrowRight'
                }
            };

            npKeyboarderMock = {
                _listeners: [],
                on: function (key, cb) {
                    this._listeners.push({
                        key: key,
                        cb: cb
                    });
                },
                off: sinon.stub(),
                _trigger: function (key) {
                    var evt = {
                        preventDefault: sinon.stub()
                    };
                    _.forEach(this._listeners, function (l) {
                        if (l.key === key) {
                            l.cb(evt);
                        }

                    });
                }
            };

            inject(function ($controller, $rootScope, _$q_) {
                $q = _$q_;
                scope = $rootScope.$new();
                createCtrl = function () {
                    return $controller('TreePanelCtrl', {
                        $scope: scope,
                        npPrototype: npPrototypeMock,
                        npUiCanvasAPI: npUiCanvasAPIMock,
                        npTreeModel: npTreeModelMock,
                        npTreeSelect: npTreeSelectMock,
                        npPageMetadata: npPageMetadataMock,
                        npMessaging: npMessagingMock,
                        npConstants: npConstantsMock,
                        npKeyboarder: npKeyboarderMock
                    });
                };
            });
        });

        describe('tree refresh', function () {
            it('should have a nodes property that is an array', function () {
                var treeCtrl = createCtrl();
                expect(treeCtrl.nodes).to.be.an('array');
            });

            it('should refresh the tree initially and load the nodes from the tree model', function () {
                var nodes = [{
                    id: 'node1'
                }, {
                    id: 'node2'
                }];
                npTreeModelMock.refreshModel = function () {
                    return $q.when(nodes);
                };
                var treeCtrl = createCtrl();
                scope.$apply();
                expect(treeCtrl.nodes).to.be.deep.equal(nodes);
            });

            it('should respond to the gridRefresh event and refresh the tree whenever it receives it', function () {
                var treeCtrl = createCtrl();
                expect(treeCtrl.nodes).to.be.deep.equal([]);
                var nodes = [{
                    id: 'node1'
                }, {
                    id: 'node2'
                }];
                npTreeModelMock.refreshModel = function () {
                    return $q.when(nodes);
                };
                scope.$emit('gridRefreshed');
                scope.$apply();
                expect(treeCtrl.nodes).to.be.deep.equal(nodes);
            });

            it('should trigger the expansion of selected nodes after the tree refreshed', function () {
                var spy = sinon.spy(scope, '$broadcast');
                createCtrl();
                scope.$apply();
                expect(spy.calledWith('expandSelectedNodes')).to.be.ok;
            });
        });

        describe('keyboard interaction:', function () {
            it('should select the previous node whenever the up key is pressed', function () {
                createCtrl();
                scope.$apply();
                expect(!npTreeSelectMock.selectPreviousNode.called).to.be.ok;
                npKeyboarderMock._trigger(npConstantsMock.keymap.ArrowUp);
                expect(npTreeSelectMock.selectPreviousNode.called).to.be.ok;
            });

            it('should select the previous node whenever the left key is pressed', function () {
                createCtrl();
                scope.$apply();
                expect(!npTreeSelectMock.selectPreviousNode.called).to.be.ok;
                npKeyboarderMock._trigger(npConstantsMock.keymap.ArrowLeft);
                expect(npTreeSelectMock.selectPreviousNode.called).to.be.ok;
            });

            it('should select the next node whenever the right key is pressed', function () {
                createCtrl();
                scope.$apply();
                expect(!npTreeSelectMock.selectNextNode.called).to.be.ok;
                npKeyboarderMock._trigger(npConstantsMock.keymap.ArrowRight);
                expect(npTreeSelectMock.selectNextNode.called).to.be.ok;
            });

            it('should select the next node whenever the down key is pressed', function () {
                createCtrl();
                scope.$apply();
                expect(!npTreeSelectMock.selectNextNode.called).to.be.ok;
                npKeyboarderMock._trigger(npConstantsMock.keymap.ArrowDown);
                expect(npTreeSelectMock.selectNextNode.called).to.be.ok;
            });

            it('should unregister all registered keyboard listeners when the controller is destroyed', function () {
                var onSpy = sinon.spy(npKeyboarderMock, 'on');
                createCtrl();
                scope.$apply();
                scope.$emit('$destroy');
                expect(npKeyboarderMock.off.callCount).to.be.equal(onSpy.callCount);
            });
        });

        describe('creating new pages', function () {
            it('should show the busy indicator when creating a new page', function () {
                var treeCtrl = createCtrl();
                treeCtrl.createPage();
                scope.$apply();
                expect(npMessagingMock.showBusyIndicator.called).to.be.ok;
            });

            it('should flush pending updates, create the page, reload the canvas and reload all pages when creating a new page (in that order)',
                function () {
                    var treeCtrl = createCtrl(),
                        flushUpdatesSpy = sinon.spy(npPageMetadataMock, 'flushUpdates'),
                        getPagesSpy = sinon.spy(npPrototypeMock, 'getPages');

                    treeCtrl.createPage();
                    scope.$apply();
                    expect(flushUpdatesSpy.called).to.be.ok;
                    expect(npPrototypeMock.createPages.calledAfter(flushUpdatesSpy)).to.be.ok;
                    expect(npUiCanvasAPIMock.reload.calledAfter(npPrototypeMock.createPages)).to.be.ok;
                    expect(getPagesSpy.calledAfter(npUiCanvasAPIMock.reload)).to.be.ok;
                });

            it('should set the newly created page as the current page after creating it', function () {
                var treeCtrl = createCtrl();
                treeCtrl.createPage();
                scope.$apply();
                expect(npPageMetadataMock.setCurrentPageName.calledWith(_.last(npPrototypeMock._pages).name)).to.be.ok;
            });

            it('should show an error when the create action fails', function () {
                npPrototypeMock.createPages = function () {
                    return $q.reject('failed');
                };
                var treeCtrl = createCtrl();
                treeCtrl.createPage();
                scope.$apply();
                expect(npMessagingMock.showError.called).to.be.ok;
            });
        });
    });
})();
