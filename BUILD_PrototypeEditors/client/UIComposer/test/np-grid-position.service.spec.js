'use strict';
(function () {
    var expect = chai.expect;
    describe('Service: np-grid-position', function () {
        var $q, $rootScope, npGridPosition, npGridMock, npPageMetadataHelperMock, npUiCatalogMock, npLayoutHelperMock, npPageMetadataMock,
            npUiCanvasAPIMock, npBindingHelperMock, npPageMetadataEventsMock, rootElement, firstLevelChild1, firstLevelChild2, createElement;

        beforeEach(module(function ($provide) {
            $provide.value('jQuery', window['norman-jquery']);
        }));

        beforeEach(module('uiComposer.uiCanvas'));

        beforeEach(function () {
            npUiCanvasAPIMock = {};
            npBindingHelperMock = {};
            npPageMetadataEventsMock = {
                events: {
                    mainEntityChanged: 'mainEntityChanged'
                },
                listen: sinon.stub()
            };
            npGridMock = {
                getRootElement: function () {
                    return rootElement;
                },
                getElement: function (id) {
                    if (id === 'root') {
                        return rootElement;
                    }
                    else if (id === 1) {
                        return firstLevelChild1;
                    }
                    return null;
                }
            };
            npPageMetadataMock = {
                getMainEntity: function () {
                    return $q.when('entityId');
                }
            };
            npPageMetadataHelperMock = {
                canHaveSiblings: function () {
                    return true;
                }
            };
            npUiCatalogMock = {
                isControlValidInAggregation: function () {
                    return true;
                },
                getControlDefaultAggregation: function () {
                    return 'default';
                },
                getControlAggregations: function () {
                    return [];
                }
            };
            npLayoutHelperMock = {
                isAbsoluteLayout: function () {
                    return false;
                }
            };

            // Factory function to create required mock objects
            createElement = (function () {
                var counter = 0;
                return function (parent) {
                    var elem = {
                        parentId: parent ? parent.controlId : '',
                        controlId: parent ? counter++ : 'root',
                        style: {},
                        children: [],
                        childrenMd: [],
                        controlMd: {
                            catalogControlName: 'name',
                            catalogId: 'id',
                            parentGroupId: 'groupId',
                            getParentMd: function () {
                                return parent.controlMd;
                            },
                            getChildrenMd: function () {
                                return elem.childrenMd;
                            }
                        },
                        isRootChild: function () {
                            return parent ? parent.controlId === 'root' : false;
                        },
                        isDragged: function () {
                            return false;
                        }
                    };
                    if (parent) {
                        parent.children.push(elem);
                        parent.childrenMd.push(elem.controlMd);
                    }
                    return elem;
                };
            })();

            rootElement = createElement();
            firstLevelChild1 = createElement(rootElement);
            firstLevelChild1.style = {
                top: 0,
                left: 0,
                width: 4,
                height: 2
            };
            firstLevelChild2 = createElement(rootElement);

            module(function ($provide) {
                $provide.value('npBindingHelper', npBindingHelperMock);
                $provide.value('npPageMetadataEvents', npPageMetadataEventsMock);
                $provide.value('npUiCanvasAPI', npUiCanvasAPIMock);
                $provide.value('npPageMetadata', npPageMetadataMock);
                $provide.value('npPageMetadataHelper', npPageMetadataHelperMock);
                $provide.value('npUiCatalog', npUiCatalogMock);
                $provide.value('npGrid', npGridMock);
                $provide.value('npLayoutHelper', npLayoutHelperMock);
            });

            inject(function ($injector) {
                $q = $injector.get('$q');
                $rootScope = $injector.get('$rootScope');
                npGridPosition = $injector.get('npGridPosition');
            });
            $rootScope.$apply();
        });

        it('Should return true if element is at boundary position x, y', function () {

            var elementFound = npGridPosition.containsPoint(firstLevelChild1, 0, 0);
            expect(elementFound).to.be.equal(true);

            elementFound = npGridPosition.containsPoint(firstLevelChild1, 4, 2);
            expect(elementFound).to.be.equal(true);
        });

        it('Should return true if element is within boundary position x, y', function () {
            var elementFound = npGridPosition.containsPoint(firstLevelChild1, 1, 2);
            expect(elementFound).to.be.equal(true);
        });

        it('Should return false if element is outside boundary position x, y', function () {
            var elementFound = npGridPosition.containsPoint(firstLevelChild1, 5, 0);
            expect(elementFound).to.be.equal(false);
        });

        it('Should return false if element has no style defined for position x, y', function () {
            var elementFound = npGridPosition.containsPoint(firstLevelChild2, 0, 0);
            expect(elementFound).to.be.equal(false);
        });

        it('Should return false if element is in dragged state for position x, y', function () {
            firstLevelChild1.isDragged = function () {
                return true;
            };

            var elementFound = npGridPosition.containsPoint(firstLevelChild1, 0, 0);
            expect(elementFound).to.be.equal(false);
        });

        it('Should get elements at boundary positions of x, y', function () {
            // Boundary coordinates
            var elements = npGridPosition.getElementsAtPosition(0, 0);
            expect(elements).to.be.an('array');
            expect(elements.length).to.be.equal(1);
            expect(firstLevelChild1.controlId).to.be.equal(elements[0].controlId);

            elements = npGridPosition.getElementsAtPosition(4, 2);
            expect(elements).to.be.an('array');
            expect(elements.length).to.be.equal(1);
            expect(firstLevelChild1.controlId).to.be.equal(elements[0].controlId);
        });

        it('Should get elements within boundary positions of x, y', function () {
            var elements = npGridPosition.getElementsAtPosition(1, 2);
            expect(elements).to.be.an('array');
            expect(elements.length).to.be.equal(1);
            expect(firstLevelChild1.controlId).to.be.equal(elements[0].controlId);
        });

        it('Should not get elements outside positions of x, y', function () {
            var elements = npGridPosition.getElementsAtPosition(5, 2);
            expect(elements).to.be.an('array');
            expect(elements.length).to.be.equal(0);
        });

        it('Should get elements in inverted Order at positions x, y', function () {
            firstLevelChild2.style = {
                top: 1,
                left: 1,
                width: 4,
                height: 2
            };
            var elements = npGridPosition.getElementsAtPosition(1, 1);
            expect(elements).to.be.an('array');
            expect(elements.length).to.be.equal(2);
            expect(elements[0].controlId).to.be.equal(firstLevelChild1.controlId);
            expect(elements[1].controlId).to.be.equal(firstLevelChild2.controlId);

            elements = npGridPosition.getElementsAtPosition(1, 1, true);
            expect(elements).to.be.an('array');
            expect(elements.length).to.be.equal(2);
            expect(elements[0].controlId).to.be.equal(firstLevelChild2.controlId);
            expect(elements[1].controlId).to.be.equal(firstLevelChild1.controlId);
        });

        it('Should get closest elements', function () {
            firstLevelChild2.style = {
                top: 1,
                left: 1,
                width: 4,
                height: 2
            };
            // Only one element with rootChild is considered
            var elements = npGridPosition.getClosestElementsAtPosition(2, 2);
            expect(elements).to.be.an('array');
            expect(elements.length).to.be.equal(1);

            var secondLevelChild1 = createElement(firstLevelChild1);
            secondLevelChild1.style = {
                top: 2,
                left: 2,
                width: 4,
                height: 2
            };
            // Non rootChildren are considered
            elements = npGridPosition.getClosestElementsAtPosition(2, 2);
            expect(elements).to.be.an('array');
            expect(elements.length).to.be.equal(2);
        });

        // This test is not complete. May need to revisit
        it('Should get siblings at position x and y', function () {
            firstLevelChild1.style = {};
            firstLevelChild2.style = {
                top: 1,
                left: 1,
                width: 4,
                height: 2
            };

            var elements = npGridPosition.getSiblingAtPosition(firstLevelChild1.controlMd, 1, 1);
            expect(elements.controlId).to.be.equal(firstLevelChild2.controlId);

            // Do not consider if the element is in drag state
            firstLevelChild2.isDragged = function () {
                return true;
            };
            elements = npGridPosition.getSiblingAtPosition(firstLevelChild1.controlMd, 1, 1);
            expect(elements).to.be.undefined;
        });
    });
})();
