'use strict';
(function () {

    var expect = chai.expect;

    describe('Directive: np-scale', function () {
        var elem, npScaleHelperServiceMock, npGridMock, npZoomHelperMock, npUiCanvasAPIMock, scope, $q;
        var scaleRendererSpy;

        beforeEach(module('uiComposer.uiEditor'));
        beforeEach(module(function ($provide) {
            npScaleHelperServiceMock = {
                getAllElements: function () {
                    return [angular.element('<div np-scale type="yscale" ></div>'),
                        angular.element('<div np-scale type="xscale" ></div>')
                    ];
                },
                scaleRenderer: function () {

                },
                renderHighlight: function () {
                }
            };
            npGridMock = {
                getSelectedElements: function () {
                    return [{
                        style: {
                            top: 10,
                            left: 10,
                            width: 100,
                            height: 250
                        }
                    }];
                }
            };
            npZoomHelperMock = {
                getZoomLevel: function () {
                    return 1;
                }
            };

            npUiCanvasAPIMock = {
                controlReady: function () {
                    return $q.when([{
                    }]);
                }
            };
            scaleRendererSpy = sinon.spy(npScaleHelperServiceMock, 'scaleRenderer');

            $provide.value('npScaleHelperService', npScaleHelperServiceMock);
            $provide.value('npGrid', npGridMock);
            $provide.value('npZoomHelper', npZoomHelperMock);
            $provide.value('npUiCanvasAPI', npUiCanvasAPIMock);
        }));

        beforeEach(inject(function ($rootScope, $compile, _$timeout_, _$q_) {
            $q = _$q_;
            var html = '<div id="canvas-container" class="np-e-canvas-container" style="height:1034px; width:1320px">' +
                '<div id="canvas-runtime" class="np-c-canvas-runtime" style="height:1024px; width:1290px">' +
                '<div data-element-id="0" style="height:10px; width:120px; top:30px; left:300px"></div>' +
                '</div></div>';
            angular.element(document.body).append(html);
            elem = angular.element(
                '<div np-scale type="yscale" ></div>' +
                '<div np-scale type="xscale" ></div>');
            scope = $rootScope.$new();
            elem = $compile(elem)(scope);
            scope.$digest();
        }));

        afterEach(function () {
            npScaleHelperServiceMock.scaleRenderer.restore();
            var canvasElem = document.getElementById('canvas-container');
            canvasElem.parentNode.removeChild(canvasElem);
        });

        it('should respond to the highlight event', function () {
            var renderHighlightSpy = sinon.spy(npScaleHelperServiceMock, 'renderHighlight');
            expect(renderHighlightSpy.called).to.be.equal(false);
            scope.$emit('selectionChanged');
            expect(renderHighlightSpy.called).to.be.equal(true);
        });

        it('should respond to the canvas width changes', function () {
            var element = npGridMock.getSelectedElements()[0];
            element.style.width = 200;
            expect(scaleRendererSpy.called).to.be.equal(true);
        });

        it('should respond to the canvas height changes', function () {
            var element = npGridMock.getSelectedElements()[0];
            element.style.height = 550;
            expect(scaleRendererSpy.called).to.be.equal(true);
        });

        it('should respond to the zoom changed event', function () {
            scope.$emit('zoom-changed', 2);
            expect(scaleRendererSpy.called).to.be.equal(true);
        });

    });

})();
