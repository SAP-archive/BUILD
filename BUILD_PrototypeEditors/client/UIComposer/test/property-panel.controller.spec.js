'use strict';
(function () {

    var expect = chai.expect,
        _ = window._;

    describe('Controller: property-panel', function () {
        var $rootScope, scope, npGrid, $timeout, $q, createController, gridElem, npPageMetadataHelperMock;

        var asideFactoryMock = {
                push: function () {}
            },
            npMessagingMock = {
                showError: function () {},
                isShowingBusyIndicator: function () {},
                showBusyIndicator: function () {},
                hideBusyIndicator: function () {}
            };

        var uieditorMock = {
            currentProject: 'Project123'
        };
        var npBindingHelperMock = {
            hasEntities: function () {},
            getPropertyPathsFromMd: function () {},
            getGroupPathsFromMd: function () {},
            getAllEntities: function () {}
        };

        var stateParamsMock = {
            currentProject: uieditorMock.currentProject
        };

        var npPrototypeMock = {
            getPages: function () {
                return {
                    then: function () {}
                };
            },
            flushUpdates: function () {
                return $q.when();
            },
            getPrototype: function () {
                return $q.when({isSmartApp: false});
            }
        };


        var createGridElement = function (id) {
            var proto = {
                parentId: -1,
                _selected: false,
                setSelected: function (selected) {
                    this._selected = selected;
                },
                isSelected: function () {
                    return this._selected;
                },
                isPageElement: function () {
                    return false;
                },
                canDeleteElement: function () {
                    return true;
                }
            };

            gridElem = Object.create(proto);
            _.extend(gridElem, {
                elementId: id,
                resizableWidth: true,
                resizableHeight: true,
                controlMd: {
                    controlId: 'control1',
                    catalogId: '345678',
                    properties: [{
                        name: 'width',
                        value: '100px'
                    }, {
                        name: 'height',
                        value: '200px'
                    }, {
                        name: 'src',
                        value: 'resources/123/test.png'
                    }, {
                        name: 'isEnabled',
                        value: true
                    }],
                    designProperties: [{
                        name: 'lockAspectRatio',
                        value: true
                    }]
                }
            });
            return gridElem;

        };


        var gridElement = createGridElement(1);

        var npUiCanvasAPIMock = {
            setControlPropertiesByMd: function () {}
        };

        var npUiCatalogMock = {
            getControlType: function (name) {
                return name;
            },
            getControlAggregations: function () {},
            getActions: function () {
                return [];
            },
            getControlDisplayName: function () {
                return '';
            },
            getValidControlsForAggregation: function () {},
            getControlEvents: function () {},
            getPropertyDisplayName: function () {
                return 'testDisplayName';
            },
            getPropertyPossibleValues: function () {
                return [];
            },
            getImageName: sinon.stub()
        };

        var npGridMock = {
            _elements: [gridElement],
            _elementsFlattened: [gridElement],
            getSelectedElements: function () {
                var selectedElements = [];
                for (var i = 0; i < this._elementsFlattened.length; ++i) {
                    if (this._elementsFlattened[i].isSelected()) {
                        selectedElements.push(this._elementsFlattened[i]);
                    }
                }
                return selectedElements;
            },
            getElement: function () {
                return gridElement;
            }
        };

        var npPageMetadataMock = {
            getCurrentPageName: function () {
                return 'S0';
            },
            getMainEntity: function () {
                return $q.when();
            },
            changeProperty: function () {

            }
        };

        var npImageHelperMock = {
            setOriginalDimensions: function () {

            },
            calcAspectRatio: function () {

            }
        };

        npPageMetadataHelperMock = {
            getControlDesignProperty: function () {
                return gridElement.controlMd.designProperties[0];
            },
            getControlProperty: function () {

            },
            isBound: function () {
                return false;
            },
            getDisplayableProperties: function (controlMd) {
                return controlMd.properties;
            },
            getDisplayableGroups: function (controlMd) {
                return controlMd.groups;
            }
        };

        beforeEach(module(function ($provide) {
            $provide.value('AsideFactory', asideFactoryMock);
            $provide.value('npGrid', npGridMock);
            $provide.value('ActiveProjectService', {
                id: uieditorMock.currentProject,
                name: uieditorMock.currentProject
            });
        }));

        beforeEach(module('uiComposer.uiEditor'));
        beforeEach(module('uiComposer.uiEditor.propertyPanel'));
        beforeEach(module('uiComposer.services'));

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('npUiCatalog', npUiCatalogMock);
                $provide.value('npUiCanvasAPI', npUiCanvasAPIMock);
            });
            inject(function (_$rootScope_, $document, _$timeout_, $injector, $controller) {
                $rootScope = _$rootScope_;
                $timeout = _$timeout_;
                $q = $injector.get('$q');
                npGrid = npGridMock;
                scope = $rootScope.$new();
                createController = function () {
                    return $controller('PropertyPanelCtrl', {
                        $q: $q,
                        $scope: scope,
                        $rootScope: $rootScope,
                        $document: $document,
                        npGrid: npGrid,
                        $timeout: $timeout,
                        $stateParams: stateParamsMock,
                        npUiCanvasAPI: npUiCanvasAPIMock,
                        npPrototype: npPrototypeMock,
                        npUiCatalog: npUiCatalogMock,
                        npBindingHelper: npBindingHelperMock,
                        npImageHelper: npImageHelperMock,
                        npMessaging: npMessagingMock,
                        npPageMetadata: npPageMetadataMock,
                        npPageMetadataHelper: npPageMetadataHelperMock
                    });
                };
            });
        });

        it('Test selectionChanged - control is selected', function () {
            var scopeBroadcastSpy = sinon.spy(scope, '$broadcast');
            gridElement.setSelected(true);
            scope.$broadcast('selectionChanged');

            expect(scopeBroadcastSpy.calledWith('selectionChanged')).to.be.ok;
        });

        it('Test selectionChanged - control is not selected', function () {
            var scopeBroadcastSpy = sinon.spy(scope, '$broadcast');
            scope.$broadcast('selectionChanged');

            expect(scopeBroadcastSpy.calledWith('selectionChanged')).to.be.ok;
        });

        it('should setup properties for property panel', function () {
            var ctrl = createController();
            gridElement.setSelected(true);
            scope.$broadcast('selectionChanged');
            scope.$digest();
            expect(ctrl.properties).to.have.length.above(0);
            expect(ctrl.properties.length).to.be.equal(4);
        });

        it('should display sizing panel and read the lock design property value', function () {
            var getDesignPropertySpy = sinon.spy(npPageMetadataHelperMock, 'getControlDesignProperty');
            var ctrl = createController();
            gridElement.setSelected(true);
            scope.$broadcast('selectionChanged');
            scope.$digest();
            expect(getDesignPropertySpy.called).to.be.equal(true);
            expect(ctrl.isLockedAspectRatio).to.be.equal(true);
        });

        it('should toggle aspect ratio on click of lock icon', function () {
            var changePropertySpy = sinon.spy(npPageMetadataMock, 'changeProperty');
            var ctrl = createController();
            gridElement.setSelected(true);
            scope.$broadcast('selectionChanged');
            scope.$digest();
            ctrl.toggleLockAspectRatio();
            expect(ctrl.isLockedAspectRatio).to.be.equal(false);
            expect(changePropertySpy.calledOnce).to.be.equal(true);

        });


    });
})();
