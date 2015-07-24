'use strict';
(function () {

    var expect = chai.expect;

    describe('Directive: np-ui-canvas-overlay', function () {
        var elem, scope,
            $documentMock, $q, jQueryMock, npCanvasElementDropMock, npCanvasElementHighlightMock, npDragHelperMock, npZoomHelperMock, npMessagingMock, npCanvasInteractionHelper, npGridPositionMock;

        beforeEach(module('uiComposer.uiCanvas'));

        beforeEach(function () {
            $documentMock = [{
                createEvent: function () {
                    return {
                        initEvent: function () {
                        }
                    };
                },
                querySelector: function () {
                    return {
                        dispatchEvent: this.dispatchEvent
                    };
                },
                dispatchEvent: function () {
                }
            }];

            jQueryMock = function (element) {
                element.offset = function () {
                    return {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    };
                };
                element.height = function () {
                    return 0;
                };
                element.width = function () {
                    return 0;
                };
                return element;
            };

            npCanvasElementDropMock = {
                dropAtTarget: function () {
                    return $q.when();
                }
            };

            npCanvasElementHighlightMock = {
                clearElementHighlights: function () {
                },
                highlightElementAtPosition: function () {
                },
                getHighlightedElement: function () {
                }
            };

            npGridPositionMock = {
                getSiblingAtPosition: function () {
                }
            };

            npDragHelperMock = {
                startDrag: sinon.stub(),
                endDrag: sinon.stub(),
                getDragData: sinon.stub(),
                isImageDrag: sinon.stub()
            };

            npZoomHelperMock = {
                getZoomLevel: function () {
                    return 1;
                }
            };

            npMessagingMock = {
                showError: function () {
                }
            };

            module(function ($provide) {
                $provide.value('$document', $documentMock);
                $provide.value('jQuery', jQueryMock);
                $provide.value('npCanvasElementDrop', npCanvasElementDropMock);
                $provide.value('npCanvasElementHighlight', npCanvasElementHighlightMock);
                $provide.value('npGridPosition', npGridPositionMock);
                $provide.value('npDragHelper', npDragHelperMock);
                $provide.value('npZoomHelper', npZoomHelperMock);
                $provide.value('npMessaging', npMessagingMock);
            });

            inject(function ($rootScope, $compile, _$q_, _npCanvasInteractionHelper_) {
                npCanvasInteractionHelper = _npCanvasInteractionHelper_;
                $q = _$q_;
                elem = angular.element('<div np-ui-canvas-overlay></div>');
                scope = $rootScope.$new();
                elem = $compile(elem)(scope);
                scope.$digest();
            });
        });

        describe('drag and drop of library elements:', function () {
            it('should add the "copy-effect" to the events dataTransfer on dragenter', function () {
                var canvasEvt = {
                    dataTransfer: {
                        dropEffect: 'not-copy'
                    }
                };
                npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragenter, true, canvasEvt);
                expect(canvasEvt.dataTransfer.dropEffect).to.be.equal('copy');
            });

            it('should highlight the drop target while hovering over the canvas', function () {
                var spy = sinon.spy(npCanvasElementHighlightMock, 'highlightElementAtPosition');
                var dragData = 'Button';
                npDragHelperMock.getDragData = function () {
                    return dragData;
                };
                var canvasEvt = {
                    dataTransfer: {}
                };
                npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragenter, true, canvasEvt);
                canvasEvt.dataTransfer.dropEffect = 'copy';
                npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragover, true, canvasEvt);
                expect(spy.calledWith(dragData)).to.be.equal(true);
            });

            it('should clear the highlighting when leaving the drop area', function () {
                var spy = sinon.spy(npCanvasElementHighlightMock, 'highlightElementAtPosition');
                npDragHelperMock.getDragData = function () {
                    return {
                        catalogName: 'Button'
                    };
                };
                var canvasEvt = {
                    dataTransfer: {}
                };
                npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragenter, true, canvasEvt);
                canvasEvt.dataTransfer.dropEffect = 'copy';
                npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragover, true, canvasEvt);
                expect(spy.called).to.be.equal(true);
                spy = sinon.spy(npCanvasElementHighlightMock, 'clearElementHighlights');
                npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragleave, true, canvasEvt);
                expect(spy.called).to.be.equal(true);
            });

            it('should clear the highlight and drop at position on drop', function () {
                var dropSpy = sinon.spy(npCanvasElementDropMock, 'dropAtTarget'),
                    highlightSpy = sinon.spy(npCanvasElementHighlightMock, 'clearElementHighlights');
                npDragHelperMock.getDragData = function () {
                    return {
                        catalogName: 'Button'
                    };
                };
                var canvasEvt = {
                    dataTransfer: {}
                };
                npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragenter, true, canvasEvt);
                canvasEvt.canvasX = 100;
                canvasEvt.canvasY = 200;
                npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.drop, true, canvasEvt);
                expect(highlightSpy.called).to.be.equal(true);
                expect(dropSpy.called).to.be.equal(true);
                // args[0] are args of first call, args[0][0] is first argument of first call
                expect(dropSpy.args[0][0].x).to.be.equal(100);
                expect(dropSpy.args[0][0].y).to.be.equal(200);
                npCanvasElementDropMock.dropAtTarget.restore();
            });
        });

        describe('drag and drop of images from desktop onto canvas', function () {
            it('should forward the event to the imageDropZone when an image is dropped onto the canvas', function () {
                var images = [{
                        id: 'someImage'
                    }],
                    querySpy = sinon.spy($documentMock[0], 'querySelector'),
                    eventSpy = sinon.spy($documentMock[0], 'dispatchEvent');

                var canvasEvt = {
                    dataTransfer: {
                        images: images
                    }
                };
                npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.drop, true, canvasEvt);
                expect(querySpy.calledWith('#imageDropZone')).to.be.equal(true);
                expect(eventSpy.called).to.be.equal(true);
                expect(eventSpy.args[0][0].dataTransfer.images).to.be.an('array');
            });
        });
    });
})();
