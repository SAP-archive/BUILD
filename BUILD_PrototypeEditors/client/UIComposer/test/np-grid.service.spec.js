'use strict';
(function () {

    var expect = chai.expect,
        _ = window._;

    describe('Service: np-grid', function () {
        var $rootScope, $q, npGrid,
            npPageMetadataMock, npPageMetadataEventsMock, npFormFactorMock, npPageMetadataHelperMock, npUiCatalogMock, npConstantsMock,
            npUiCanvasAPIMock, npCanvasEventsMock,
            pageCtrl, firstLevelChild1, firstLevelChild2;

        beforeEach(module(function ($provide) {
            $provide.value('jQuery', window['norman-jquery']);
        }));

        beforeEach(module('uiComposer.uiCanvas'));

        beforeEach(function () {
            npPageMetadataMock = {
                _pageMetadata: {
                    rootControlId: 'rootCtrl',
                    controls: []
                },
                getCurrentPageName: function () {
                    return 'S1';
                },
                getPageMetadata: function () {
                    return $q.when(this._pageMetadata);
                }
            };
            npPageMetadataHelperMock = {
                getControlDesignProperty: function () {
                },
                getDisplayableProperties: function (controlMd) {
                    return controlMd.properties;
                },
                getDisplayableGroups: function (controlMd) {
                    return controlMd.groups;
                }
            };

            npUiCatalogMock = {
                getControlDefaultAggregation: function () {
                    return 'default';
                },
                isControlValidInAggregation: function () {
                    return true;
                },
                getControlDisplayName: function () {
                }
            };

            // Mock out structure of contents in iframe here
            // Factory function to create required mock objects
            var createControlMd = (function () {
                var counter = 0;
                return function (parent) {
                    var elem = {
                        controlId: parent ? counter++ : 'rootCtrl',
                        parentControlId: parent ? parent.controlId : -1,
                        groups: [{
                            groupId: '',
                            children: []
                        }],
                        getChildrenMd: function () {
                            return _.map(this.groups[0].children, function (childId) {
                                return _.find(npPageMetadataMock._pageMetadata.controls, {
                                    controlId: childId
                                });
                            });
                        }
                    };
                    if (parent) {
                        parent.groups[0].children.push(elem.controlId);
                    }
                    npPageMetadataMock._pageMetadata.controls.push(elem);
                    return elem;
                };
            })();

            pageCtrl = createControlMd();
            firstLevelChild1 = createControlMd(pageCtrl);
            firstLevelChild2 = createControlMd(pageCtrl);
            createControlMd(firstLevelChild1);
            createControlMd(firstLevelChild1);

            npPageMetadataEventsMock = {
                events: {},
                listen: function () {
                }
            };
            npCanvasEventsMock = {
                events: {},
                listen: sinon.stub()
            };

            npFormFactorMock = {
                getCurrentFormFactor: function () {
                }
            };

            npConstantsMock = {
                designProperties: {
                    BGCOLOR: 'backgroundColor'
                },
                sizeProperties: {
                    WIDTH: 'width',
                    HEIGHT: 'height'
                }
            };
            npUiCanvasAPIMock = {
                getControlDomRefByMd: function () {
                    return '<div style="height: 100px; width: 100px"></div>';
                }
            };

            module(function ($provide) {
                $provide.value('npUiCanvasAPI', npUiCanvasAPIMock);
                $provide.value('npConstants', npConstantsMock);
                $provide.value('npPageMetadata', npPageMetadataMock);
                $provide.value('npPageMetadataHelper', npPageMetadataHelperMock);
                $provide.value('npUiCatalog', npUiCatalogMock);
                $provide.value('npPageMetadataEvents', npPageMetadataEventsMock);
                $provide.value('npFormFactor', npFormFactorMock);
                $provide.value('npCanvasEvents', npCanvasEventsMock);
            });

            inject(function ($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                npGrid = $injector.get('npGrid');
            });
        });

        beforeEach(function () {
            npGrid.init('S1');
            $rootScope.$apply();
        });

        describe('grid elements:', function () {
            it('should give grid elements some default values', function () {
                var element = npGrid.getElements()[0];
                expect(element.elementId).to.be.a('number');
                expect(element.parentId).to.be.a('number');
                expect(element.style).to.be.an('object');
                expect(element.children).to.be.an('array');
            });

            it('should give root grid element with some default values', function () {
                var element = npGrid.getRootElement();
                expect(element.isSelected()).to.be.equal(false);
                expect(element.isDragged()).to.be.equal(false);
                expect(element.isPageElement()).to.be.equal(true);
                expect(element.isRootChild()).to.be.equal(false);
                expect(element.canDeleteElement()).to.be.equal(false);
            });

            it('should support selection and unselection of grid elements', function () {
                var element = npGrid.getElementForControlId(firstLevelChild1.controlId);
                expect(element.isSelected()).to.be.equal(false);
                element.setSelected(true);
                expect(element.isSelected()).to.be.equal(true);
                element.setSelected(false);
                expect(element.isSelected()).to.be.equal(false);
            });

            it('should notify others whenever a grid element is selected', function () {
                var spy = sinon.spy($rootScope, '$broadcast');
                npGrid.setSelectedElements([npGrid.getElement(1)]);
                expect(spy.calledWith('selectionChanged')).to.be.equal(true);
                $rootScope.$broadcast.restore();
            });

            it('should not notify others if selection did not change', function () {
                npGrid.setSelectedElements();
                var spy = sinon.spy($rootScope, '$broadcast');
                expect(npGrid.getRootElement().isSelected()).to.be.equal(true);
                npGrid.setSelectedElements();
                expect(spy.calledWith('selectionChanged')).to.be.equal(false);
                $rootScope.$broadcast.restore();
            });

            it('should support dragging of grid elements', function () {
                var element = npGrid.getElements(true)[0];
                expect(element.isDragged()).to.be.equal(false);
                element.startDrag();
                expect(element.isDragged()).to.be.equal(true);
                element.stopDrag();
                expect(element.isDragged()).to.be.equal(false);
            });
        });

        describe('grid:', function () {
            it('should return an array of grid elements', function () {
                var elements = npGrid.getElements();
                expect(elements).to.be.an('array');
                // Length should be 1 as all further elements are children of page
                expect(elements.length).to.be.equal(1);
            });

            it('should return an object of grid elements that has a elementId -> grid element mapping', function () {
                var elementsObj = npGrid.getElementsFlattened(true);
                expect(elementsObj).to.be.an('object');
                expect(Object.keys(elementsObj).length).to.be.equal(npPageMetadataMock._pageMetadata.controls.length);

                var rootElement = npGrid.getElements(true)[0];
                expect(elementsObj[rootElement.elementId]).to.be.equal(rootElement);
            });

            it('should return grid elements by id (type number)', function () {
                var elementId = npGrid.getElements()[0].elementId,
                    element = npGrid.getElement(elementId);
                expect(element).to.be.an('object');
            });

            it('should return grid elements by id (type string)', function () {
                var elementId = '' + npGrid.getElements()[0].elementId,
                    element = npGrid.getElement(elementId);
                expect(element).to.be.an('object');
            });

            it('should return undefined if id is out of range', function () {
                var element = npGrid.getElement(-5);
                expect(element).to.be.undefined;
            });

            it('should return grid elements for canvas controls', function () {
                var element = npGrid.getElementForControlId(firstLevelChild1.controlId);
                expect(element).to.be.an('object');

                var gridElements = npGrid.getElementsFlattened(true);
                expect(gridElements[element.elementId]).to.be.equal(element);
            });

            it('should return all selected elements', function () {
                // unselect page first as it is always selected by default
                npGrid.getElements(true)[0].setSelected(false);
                var element1 = npGrid.getElementForControlId(firstLevelChild1.controlId);
                element1.setSelected(true);
                expect(npGrid.getSelectedElements().length).to.be.equal(1);
                var element2 = npGrid.getElementForControlId(firstLevelChild2.controlId);
                element2.setSelected(true);
                expect(npGrid.getSelectedElements().length).to.be.equal(2);
            });
        });

    });
})();
