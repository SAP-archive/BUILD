'use strict';
(function () {

    var expect = chai.expect;

    // TODO: unit tests sare very basic, should be improved
    // jQuery will likely have to be mocked out for this to test more complicated features of this directive
    describe('Directive: np-canvas-element-move', function () {
        var $rootScope, $q, npCanvasInteractionHelper, scope, elem, canvasEvt;
        var npPageMetadataHelperMock, npUiCanvasAPIMock, npGridMock, npGridPositionMock, npSnapGuideMock, npCanvasElementHighlightMock, npCanvasElementDropMock, npLayoutHelperMock, npAbsoluteLayoutHelperMock, npMessagingMock;

        var createGridElement = function (id) {
            var gridElemProto = {
                    _selected: false,
                    _dom: angular.element('<div style="height: 100px; width: 100px"></div>'),
                    isSelected: function () {
                        return this._selected;
                    },
                    startDrag: function () {
                    },
                    stopDrag: function () {
                    },
                    domRef: function () {
                        return this._dom;
                    },
                    isRootChild: function () {
                        return id === 1;
                    },
                    controlMd: {
                        controlId: id
                    },
                    style: {
                        height: '100px',
                        width: '100px',
                        left: '0px',
                        top: '0px'
                    }
                },
                element = Object.create(gridElemProto);
            _.extend(element, {
                elementId: id
            });
            return element;
        };

        var getDragWrapper = function () {
            return window.document.getElementById('dragWrapper');
        };

        beforeEach(module('uiComposer.uiCanvas'));

        beforeEach(function () {
            npUiCanvasAPIMock = {
                getWindow: function () {
                    return window;
                }
            };
            npGridMock = {
                _elements: [createGridElement(0), createGridElement(1), createGridElement(2)],
                setSelectedElements: function () {
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
                    return npGridMock._elements;
                },
                getSiblingAtPosition: function () {
                }
            };
            npSnapGuideMock = {
                updateElementsPositions: function () {
                },
                clearGuideLines: function () {
                },
                updateSnapPosition: function () {
                }
            };
            npCanvasElementDropMock = {
                moveAtTarget: function () {
                    return $q.when();
                }
            };

            npLayoutHelperMock = {
                isAbsoluteLayout: function () {
                    return true;
                }
            };

            npAbsoluteLayoutHelperMock = {
                init: sinon.stub()
            };

            npMessagingMock = {
                showError: function () {
                }
            };

            npCanvasElementHighlightMock = {
                highlightElementAtPosition: function () {
                },
                clearElementHighlights: function () {
                },
                getHighlightedElement: function () {
                }
            };

            npPageMetadataHelperMock = {
                canMoveControl: function () {
                    return true;
                }
            };

            canvasEvt = {
                canvasHeight: 600,
                canvasWidth: 800,
                canvasX: 0,
                canvasY: 0,
                target: {
                    classList: ['np-c-grid-element']
                }
            };
            _.extend(canvasEvt.target.classList, {
                contains: function (value) {
                    return _.includes(this, value);
                }
            });

            module(function ($provide) {
                $provide.value('npUiCanvasAPI', npUiCanvasAPIMock);
                $provide.value('npGrid', npGridMock);
                $provide.value('npGridPosition', npGridPositionMock);
                $provide.value('npSnapGuide', npSnapGuideMock);
                $provide.value('npCanvasElementHighlight', npCanvasElementHighlightMock);
                $provide.value('npCanvasElementDrop', npCanvasElementDropMock);
                $provide.value('npAbsoluteLayoutHelper', npAbsoluteLayoutHelperMock);
                $provide.value('npLayoutHelper', npLayoutHelperMock);
                $provide.value('npPageMetadataHelper', npPageMetadataHelperMock);
                $provide.value('npMessaging', npMessagingMock);
            });

            inject(function (_$rootScope_, $compile, _npCanvasInteractionHelper_, _$q_) {
                $rootScope = _$rootScope_;
                npCanvasInteractionHelper = _npCanvasInteractionHelper_;
                $q = _$q_;
                elem = angular.element('<div np-canvas-element-move>' +
                    '<div ng-repeat="element in elements" data-element-id="{{element.elementId}}" np-selected="{{element._selected}}" ng-style="element.style"></div>' +
                    '</div>');
                scope = $rootScope.$new();
                scope.elements = npGridMock._elements;
                elem = $compile(elem)(scope);
                scope.$digest();
            });
        });

        afterEach(function () {
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragend, true, {
                canvasHeight: 600,
                canvasWidth: 800,
                canvasX: 0,
                canvasY: 0
            });
            $rootScope.$apply();
        });

        it('should start dragging the top level element of a page at dragstart position by default if nothing is selected', function () {
            var spy = sinon.spy(npGridMock._elements[0], 'startDrag');
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, true, canvasEvt);
            expect(spy.called).to.be.equal(true);
        });

        it('should start dragging the top most element (root child)', function () {
            var spyUnselectedElement = sinon.spy(npGridMock._elements[0], 'startDrag');
            var spySelectedElement = sinon.spy(npGridMock._elements[1], 'startDrag');
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, true, canvasEvt);
            expect(spyUnselectedElement.called).to.be.equal(true);
            expect(spySelectedElement.called).to.be.equal(false);
        });

        it('should start dragging the selected element at dragstart position if there is one', function () {
            npGridMock._elements[1]._selected = true;
            sinon.stub(npGridPositionMock, 'getElementsAtPosition', function () {
                return [npGridMock._elements[1]];
            });
            var spyUnselectedElement = sinon.spy(npGridMock._elements[0], 'startDrag');
            var spySelectedElement = sinon.spy(npGridMock._elements[1], 'startDrag');
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, true, canvasEvt);
            expect(spyUnselectedElement.called).to.be.equal(false);
            expect(spySelectedElement.called).to.be.equal(true);
            npGridPositionMock.getElementsAtPosition.restore();
        });

        it('should select the element that is being dragged', function () {
            var spy = sinon.spy(npGridMock, 'setSelectedElements');
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, true, canvasEvt);
            // first call, first arg, first element
            var spyElem = spy.args[0][0][0];
            expect(spyElem).to.be.equal(npGridMock._elements[0]);
        });

        it('should add/remove dragWrapper', function () {
            expect(getDragWrapper()).not.to.exist;
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, true, canvasEvt);
            expect(getDragWrapper()).to.exist;
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragmove, true, canvasEvt);
            expect(getDragWrapper()).to.exist;
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragend, true, canvasEvt);
            $rootScope.$apply();
            expect(getDragWrapper()).not.to.exist;
        });

        it('should update the drag position on move', function () {
            var elementBeingMoved = npGridMock._elements[0];
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, true, canvasEvt);

            canvasEvt.canvasX = 80;
            canvasEvt.canvasY = 50;
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragmove, true, canvasEvt);

            expect(elementBeingMoved.style.left).to.be.equal('80px');
            expect(elementBeingMoved.style.top).to.be.equal('50px');

            canvasEvt.canvasX = 150;
            canvasEvt.canvasY = 200;
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragmove, true, canvasEvt);
            expect(elementBeingMoved.style.left).to.be.equal('150px');
            expect(elementBeingMoved.style.top).to.be.equal('200px');
        });

        it('should stay within canvas bounds when updating the drag position on move (check left and top side)', function () {
            var elementBeingMoved = npGridMock._elements[0];
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, true, canvasEvt);

            canvasEvt.canvasX = -50;
            canvasEvt.canvasY = -50;
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragmove, true, canvasEvt);
            expect(elementBeingMoved.style.left).to.be.equal('0px');
            expect(elementBeingMoved.style.top).to.be.equal('0px');
        });

        it('should stay within canvas bounds when updating the drag position on move (check right and bottom side)', function () {
            var elementBeingMoved = npGridMock._elements[0];
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, true, canvasEvt);

            canvasEvt.canvasX = 1000;
            canvasEvt.canvasY = 1000;
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragmove, true, canvasEvt);
            expect(elementBeingMoved.style.top).to.be.equal('500px'); // canvas height - element height
            expect(elementBeingMoved.style.left).to.be.equal('700px'); // canvas width - element width
        });

        it('should prefer the snap position over the drag position when the snap service returns one', function () {
            var elementBeingMoved = npGridMock._elements[0];
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, true, canvasEvt);

            canvasEvt.canvasX = 113;
            canvasEvt.canvasY = 118;
            npSnapGuideMock.updateSnapPosition = function () {
                return {
                    x: 110,
                    y: 120
                };
            };
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragmove, true, canvasEvt);
            expect(elementBeingMoved.style.top).to.be.equal('120px');
            expect(elementBeingMoved.style.left).to.be.equal('110px');
        });

        it('should only show snap guides when the page is drop target', function () {
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, true, canvasEvt);

            var spy = sinon.spy(npSnapGuideMock, 'updateElementsPositions');
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragmove, true, canvasEvt);
            expect(spy.called).to.be.equal(false);
        });

        it('should put back to original position if cannot be dropped in new position and notify user', function () {
            var elementBeingMoved = npGridMock._elements[0],
                messagingSpy = sinon.spy(npMessagingMock, 'showError');
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, true, canvasEvt);

            canvasEvt.canvasX = 150;
            canvasEvt.canvasY = 200;
            sinon.stub(npCanvasElementDropMock, 'moveAtTarget', function () {
                return $q.reject();
            });
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragend, true, canvasEvt);
            $rootScope.$apply();
            expect(elementBeingMoved.style.left).to.be.equal('0px');
            expect(elementBeingMoved.style.top).to.be.equal('0px');
            expect(messagingSpy.called).to.be.ok;
            npCanvasElementDropMock.moveAtTarget.restore();
            npMessagingMock.showError.restore();
        });
    });
})();
