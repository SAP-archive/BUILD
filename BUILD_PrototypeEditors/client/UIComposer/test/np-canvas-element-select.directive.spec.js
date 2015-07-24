'use strict';
(function () {

    // apparently PhantomJS@1.8 does not implement the bind function, add polyfill here
    // https://github.com/ariya/phantomjs/issues/10522
    if (!Function.prototype.bind) {
        var fn = Function;
        fn.prototype.bind = function (oThis) {
            if (typeof this !== 'function') {
                // closest thing possible to the ECMAScript 5
                // internal IsCallable function
                throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {
                },
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                        aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    var expect = chai.expect;

    describe('Directive: np-canvas-element-select', function () {
        var $rootScope, npCanvasInteractionHelper, scope, elem;
        var npGridMock, npGridPositionMock, npConstantsMock, npKeyboarderMock, npUiCatalogMock, uieditorCtrlMock, uicanvasCtrlMock, npPrototypeMock, npPageMetadataMock;

        var createGridElement = (function () {
            var count = 0,
                proto = {
                    parentId: -1,
                    _selected: false,
                    _dom: '<div></div>',
                    setSelected: function (selected) {
                        this._selected = selected;
                    },
                    isSelected: function () {
                        return this._selected;
                    },
                    domRef: function () {
                        return angular.element(this._dom);
                    },
                    isRootChild: function () {
                        return this.parentId === -1;
                    }
                };
            return function (parent) {
                var element = Object.create(proto);
                element.elementId = count++;
                element.controlMd = {
                    controlId: element.elementId
                };
                element.children = [];
                if (parent) {
                    element.parentId = parent.elementId;
                    parent.children.push(element);
                }
                return element;

            };
        })();

        beforeEach(module('uiComposer.uiCanvas'));

        beforeEach(function () {
            /*
             * Selection relies mainly on grid, need to mock out structure here
             * To test selection we are going with the following structure:
             * - top level element with 2 children, each child has 2 children again
             * - 2nd top level element without children
             */
            var p1 = createGridElement(),
                p2 = createGridElement(),
                flc1 = createGridElement(p1),
                flc2 = createGridElement(p1),
                slc1 = createGridElement(flc1),
                slc2 = createGridElement(flc1),
                slc3 = createGridElement(flc2),
                slc4 = createGridElement(flc2);

            npGridMock = {
                _elements: [p1, p2],
                _elementsFlattened: [p1, p2, flc1, flc2, slc1, slc2, slc3, slc4],
                getElement: function (id) {
                    for (var i = 0; i < this._elementsFlattened.length; ++i) {
                        if (this._elementsFlattened[i].elementId === id) {
                            return this._elementsFlattened[i];
                        }
                    }
                },
                getElementForControlId: function (controlId) {
                    for (var i = 0; i < this._elementsFlattened.length; ++i) {
                        if (this._elementsFlattened[i].controlMd.controlId === controlId) {
                            return this._elementsFlattened[i];
                        }
                    }
                },
                getSelectedElements: function () {
                    var selectedElements = [];
                    for (var i = 0; i < this._elementsFlattened.length; ++i) {
                        if (this._elementsFlattened[i].isSelected()) {
                            selectedElements.push(this._elementsFlattened[i]);
                        }
                    }
                    return selectedElements;
                },
                setSelectedElements: function (elems) {
                    var i;
                    elems = elems || [];
                    for (i = 0; i < this._elementsFlattened.length; i++) {
                        this._elementsFlattened[i].setSelected(false);
                    }
                    for (i = 0; i < elems.length; i++) {
                        elems[i].setSelected(true);
                    }
                },
                getTopElement: function (elements, i) {
                    if (i < 0) {
                        i = 0;
                    }
                    return elements[i];
                }
            };
            npGridPositionMock = {
                getElementsAtPosition: function () {
                    console.log('old elementsAtPosition called');
                    // setup in each test according to test condition
                    return [];
                },
                containsPoint: function () {
                    return false;
                },
                getClosestElementsAtPosition: function () {
                    return npGridMock._elements[0];
                }
            };
            npConstantsMock = {
                keymap: {
                    UP: 38,
                    DOWN: 40
                }
            };

            // TODO implement mock
            npKeyboarderMock = {
                on: function () {
                }
            };

            npUiCatalogMock = {
                getControlDisplayName: function () {
                    return 'Display name';
                }
            };

            uieditorCtrlMock = {
                rightclickMenu: {}
            };

            uicanvasCtrlMock = {};

            npPrototypeMock = {};

            npPageMetadataMock = {};

            module(function ($provide) {
                $provide.value('npGrid', npGridMock);
                $provide.value('npGridPosition', npGridPositionMock);
                $provide.value('npConstants', npConstantsMock);
                $provide.value('npKeyboarder', npKeyboarderMock);
                $provide.value('npUiCatalog', npUiCatalogMock);
                $provide.value('npPrototype', npPrototypeMock);
                $provide.value('npPageMetadata', npPageMetadataMock);
            });

            inject(function (_$rootScope_, $compile, _npCanvasInteractionHelper_) {
                $rootScope = _$rootScope_;
                npCanvasInteractionHelper = _npCanvasInteractionHelper_;
                elem = angular.element('<div np-canvas-element-select></div>');
                scope = $rootScope.$new();
                scope.uieditor = uieditorCtrlMock;
                scope.canvas = uicanvasCtrlMock;
                scope.showPropertiesEditor = function () {
                };
                elem = $compile(elem)(scope);
                scope.$digest();
            });
        });

        beforeEach(function () {
            for (var i = 0; i < npGridMock._elementsFlattened; ++i) {
                expect(npGridMock._elementsFlattened[i].isSelected()).to.be.equal(false);
            }
        });

        afterEach(function () {
        });

        // click will trigger click on element first, then on document
        var triggerClick = function () {
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.click, true, {});
        };

        // double click will trigger click twice and then double click
        var triggerDblclick = function () {
            triggerClick();
            triggerClick();
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dblclick, true, {});
        };

        describe('left click handling:', function () {
            it('should not select anything if there is nothing at click position', function () {
                npGridPositionMock.getElementsAtPosition = function () {
                    return [];
                };
                triggerClick();
                for (var i = 0; i < npGridMock._elementsFlattened; ++i) {
                    expect(npGridMock._elementsFlattened[i].isSelected()).to.be.equal(false);
                }
                triggerDblclick();
                for (i = 0; i < npGridMock._elementsFlattened; ++i) {
                    expect(npGridMock._elementsFlattened[i].isSelected()).to.be.equal(false);
                }
            });

            it('should unselect everything if there is nothing at click position', function () {
                npGridMock._elements[0].setSelected(true);
                npGridMock._elements[0].children[0].setSelected(true);
                npGridMock._elements[0].children[0].children[1].setSelected(true);
                npGridMock._elements[1].setSelected(true);

                npGridPositionMock.getElementsAtPosition = function () {
                    return [];
                };
                triggerClick();
                for (var i = 0; i < npGridMock._elementsFlattened; ++i) {
                    expect(npGridMock._elementsFlattened[i].isSelected()).to.be.equal(false);
                }
                triggerDblclick();
                for (i = 0; i < npGridMock._elementsFlattened; ++i) {
                    expect(npGridMock._elementsFlattened[i].isSelected()).to.be.equal(false);
                }
            });

            it('should select the element under cursor on single click if there is just 1 element at that position', function () {
                npGridPositionMock.getElementsAtPosition = function () {
                    return [npGridMock._elements[1]];
                };
                triggerClick();
                expect(npGridMock._elements[1].isSelected()).to.be.equal(true);
            });

            it('should select the root control on single click if there are multiple elements at click position but none are selected', function () {
                npGridPositionMock.getElementsAtPosition = function () {
                    return [npGridMock._elements[0], npGridMock._elements[0].children[0]];
                };
                triggerClick();
                expect(npGridMock._elements[0].isSelected()).to.be.equal(true);
                expect(npGridMock._elements[0].children[0].isSelected()).to.be.equal(false);
            });

            it('should keep an element selected if there are multiple elements at click position and one of them is already selected (check for root)', function () {
                npGridMock._elements[0].setSelected(true);
                npGridPositionMock.getElementsAtPosition = function () {
                    return [npGridMock._elements[0], npGridMock._elements[0].children[0]];
                };
                triggerClick();
                expect(npGridMock._elements[0].isSelected()).to.be.equal(true);
                expect(npGridMock._elements[0].children[0].isSelected()).to.be.equal(false);
            });

            it('should select top element at position', function () {
                var _elem = npGridMock._elements[0],
                    child = _elem.children[0];
                npGridMock.getSelectedElements = function () {
                    return [];
                };
                npGridPositionMock.getElementsAtPosition = function () {
                    return [_elem];
                };
                triggerClick();
                expect(_elem.isSelected()).to.be.equal(true);
                expect(child.isSelected()).to.be.equal(false);
            });

            it('should select child of element at position', function () {
                var _elem = npGridMock._elements[0],
                    child = _elem.children[0];
                _elem.setSelected(true);
                npGridMock.getSelectedElements = function () {
                    return [_elem];
                };
                npGridPositionMock.containsPoint = function (element) {
                    return element === _elem || element === child;
                };

                npGridPositionMock.getElementsAtPosition = function () {
                    return [_elem, child];
                };
                triggerClick();
                expect(_elem.isSelected()).to.be.equal(false);
                expect(child.isSelected()).to.be.equal(true);
            });

            it('should select sibling of element', function () {
                var _elem = npGridMock._elements[0],
                    child1 = _elem.children[0],
                    child2 = _elem.children[1];
                child1.setSelected(true);
                npGridMock.getSelectedElements = function () {
                    return [child1];
                };
                npGridPositionMock.containsPoint = function (element) {
                    return element === _elem || element === child2;
                };

                npGridPositionMock.getElementsAtPosition = function () {
                    return [_elem, child2];
                };
                triggerClick();
                expect(_elem.isSelected()).to.be.equal(false);
                expect(child1.isSelected()).to.be.equal(false);
                expect(child2.isSelected()).to.be.equal(true);
            });

            it('should bypass invisible elements', function () {
                // page is selected, pageChild is invisible, pageChildChild has a renderer
                // child has a renderer, should be selectable
                var page = npGridMock._elements[0],
                    pageChild = page.children[0],
                    pageChildChild = pageChild.children[0];
                page.setSelected(true);
                npGridMock.getSelectedElements = function () {
                    return [page];
                };
                npGridPositionMock.containsPoint = function (element) {
                    return element === page || element === pageChildChild;
                };

                npGridPositionMock.getElementsAtPosition = function () {
                    return [page, pageChildChild];
                };
                pageChild._dom = undefined;

                triggerClick();
                expect(page.isSelected()).to.be.equal(false);
                expect(pageChild.isSelected()).to.be.equal(false);
                expect(pageChildChild.isSelected()).to.be.equal(true);
            });
        });

        describe('right click handling:', function () {
        });

        describe('keyboard handling:', function () {
        });

        describe('multi select handling:', function () {
        });
    });
})();
