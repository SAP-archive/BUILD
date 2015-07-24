'use strict';

(function () {

    var expect = chai.expect;

    describe('Directive: np-canvas-element-resizable', function () {

        var npGridMock, npUiCanvasAPIMock, npSnapGuideMock, npImageHelperMock, npConstantsMock, npPropertyChangeObserverMock,
            $rootScope, element, scope, $compile, gridElement, npPageMetadataHelperMock, npPageMetadataMock, $document, npCanvasInteractionHelper, canvasEvt;

        beforeEach(module('uiComposer.uiCanvas'));

        beforeEach(function () {

            var createGridElement = function (id) {
                var proto = {
                        _selected: false,
                        setSelected: function (selected) {
                            this._selected = selected;
                        },
                        isSelected: function () {
                            return this._selected;
                        },
                        style: {
                            height: '100px',
                            width: '100px',
                            left: '0px',
                            top: '0px'
                        }
                    },
                    element = Object.create(proto);
                _.extend(element, {
                    elementId: id,
                    resizableWidth: true,
                    resizableHeight: true,
                    controlMd: {
                        controlId: 'control1',
                        properties: [{
                            name: 'width',
                            value: '100px'
                        },
                            {
                                name: 'height',
                                value: '100px'
                            }]
                    }
                });
                return element;
            };

            gridElement = createGridElement(1);

            npGridMock = {
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

            npPageMetadataHelperMock = {
                getControlDesignProperty: function () {
                    return {
                        name: 'lockAspectRatio',
                        value: true
                    };
                },
                getControlProperty : function () {
                    return {
                        name: 'width',
                        value : '100px'
                    }
                }
            };

            npPropertyChangeObserverMock = {
                doPropertyChange: function () {

                }
            };

            npPageMetadataMock = {
                changeProperty: function () {

                }
            };

            npConstantsMock = {
                designProperties: {
                    LOCKASPECT: 'lockAspectRatio'
                },
                sizeProperties: {
                    WIDTH: 'width',
                    HEIGHT: 'height'
                }
            };
            npImageHelperMock = {

                getHeightForFixedWidth: function () {
                    return;
                },

                getWidthForFixedHeight: function () {
                    return;
                },

                calcAspectRatio: function () {

                }
            };

            npUiCanvasAPIMock = {
                getDefaultGroup: function () {
                    return {
                        children: [{}]
                    };
                },
                getControlProperties: function () {
                    return [{
                        name: 'width'
                    }, {
                        name: 'height'
                    }];
                },
                setControlPropertiesByMd: function () {
                }
            };

            npSnapGuideMock = {
                updateSnapPosition: function () {
                    return {};
                },
                clearGuideLines: function () {

                },
                updateElementsPositions: function () {

                }
            };

            module(function ($provide) {
                $provide.value('npGrid', npGridMock);
                $provide.value('npUiCanvasAPI', npUiCanvasAPIMock);
                $provide.value('npSnapGuide', npSnapGuideMock);
                $provide.value('npImageHelper', npImageHelperMock);
                $provide.value('npConstants', npConstantsMock);
                $provide.value('npPageMetadataHelper', npPageMetadataHelperMock);
                $provide.value('npPropertyChangeObserver', npPropertyChangeObserverMock);
                $provide.value('npPageMetadata', npPageMetadataMock);
            });

            inject(function (_$rootScope_, _$compile_, _$document_, _npCanvasInteractionHelper_) {
                canvasEvt = {
                    canvasX: 234,
                    canvasY: 123,
                    target: {
                        classList: ['np-c-e-resize', 'np-c-s-resize', 'np-c-se-resize'],
                        getAttribute: function () {
                            return '1';
                        }
                    }
                };
                _.extend(canvasEvt.target.classList, {
                    contains: function (value) {
                        return _.includes(this, value);
                    }
                });
                npCanvasInteractionHelper = _npCanvasInteractionHelper_;
                var html = '<div id="canvas-container" class="np-e-canvas-container" style="height:1034px; width:1320px">' +
                    '<div id="canvas-runtime" class="canvasRuntime" style="height:1024px; width:1290px;">' +
                    '<div class="np-c-grid-element" data-element-id="1" np-selected=' + gridElement._selected + '>' +
                    '<div ng-if="' + gridElement._selected + '">' +
                    '<div class="np-c-e-resize"></div>' +
                    '<div class="np-c-s-resize"></div>' +
                    '<div class="np-c-se-resize"></div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';

                angular.element(document.body).append(html);
                element = angular.element('<div np-canvas-element-resizable></div>');
                $rootScope = _$rootScope_;
                scope = $rootScope.$new();
                $compile = _$compile_;
                $document = _$document_;
                element = $compile(element)(scope);

                scope.$digest();
            });
        });

        it('Test selectionChanged - control is selected', function () {
            gridElement.setSelected(true);
            expect(gridElement._selected).to.be.equal(true);
        });

        it('should check if lockaspect ratio flag is being set', function () {
            var lockedSpy = sinon.spy(npPageMetadataHelperMock, 'getControlDesignProperty');
            gridElement.setSelected(true);
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, true, canvasEvt);
            expect(lockedSpy.called).to.be.equal(true);
        });

        it('should check if pageMetadata get updated on mouse up', function () {
            var pageMdSpy = sinon.spy(npPageMetadataMock, 'changeProperty');
            gridElement.setSelected(true);
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, true, canvasEvt);
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragend, true, canvasEvt);
            expect(pageMdSpy.called).to.be.equal(true);
        });

        it('should check that only canvas gets updated on mousemove and not pagemetadata', function () {
            var pageMdSpy = sinon.spy(npPageMetadataMock, 'changeProperty');
            var canvasSpy = sinon.spy(npUiCanvasAPIMock, 'setControlPropertiesByMd');
            gridElement.setSelected(true);
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, true, canvasEvt);
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragmove, true, canvasEvt);
            expect(pageMdSpy.called).to.be.equal(false);
            expect(canvasSpy.called).to.be.equal(true);
        });
    });
})();
