'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-scale-helper-service', function () {
        var npScaleHelperService, npZoomHelperMock, npConstantsMock, npFormFactorMock, jQuery;
        var zoom = 1;
        var selectedElement = {
            style: {
                top: '20px',
                left: '40px',
                height: '100px',
                width: '200px'
            }
        };

        beforeEach(module(function ($provide) {
            $provide.value('jQuery', window['norman-jquery']);
            $provide.value('npZoomHelper', npZoomHelperMock);
            $provide.value('npConstants', npConstantsMock);
            $provide.value('npFormFactor', npFormFactorMock);
        }));

        beforeEach(module('uiComposer.uiEditor'));

        beforeEach(function () {
            npZoomHelperMock = {
                getZoomLevel: function () {
                    return 0.4;
                }
            };

            npConstantsMock = {
                scale: {
                    SCALESETDIMENSION: 25,
                    TICKS: 10,
                    TICKSIZE: 20,
                    MAJORTICKS: 100,
                    HEIGHTOFMAJORTICK: -10,
                    HEIGHTOFMINORTICK: -6,
                    RANGEOFWIDTHFORNOOFTICKS: 300,
                    XFORXSCALETICKS: '7.5',
                    XFORYSCALETICKS: '-7.5',
                    YFORXSCALETICKS: '-10.5',
                    YFORYSCALETICKS: '-13'
                }
            };

            npFormFactorMock = {
                getCurrentFormFactor: function () {
                    return {
                        width: 20,
                        height: 1024
                    };
                }
            };

            inject(function ($injector) {
                var html = '<div id="canvas-container" class="np-e-canvas-container" style="height:1034px; width:1320px">' +
                    '<div id="canvas-runtime" class="canvasRuntime" style="height:1024px; width:1290px;">' +
                    '<div np-scale id="yscale" type="yscale" class="np-e-canvas-yscale">' +
                    '<svg class="np-e-svg-yscale"><g transform="translate(20,20)"></g></svg></div>' +
                    '<div np-scale id="xscale" type="xscale" class="np-e-canvas-xscale">' +
                    '<svg class="np-e-svg-xscale"><g transform="translate(20,20)"></g></svg></div>' +
                    '</div></div>';
                angular.element(document.body).append(html);
                npScaleHelperService = $injector.get('npScaleHelperService');
                jQuery = $injector.get('jQuery');
            });
        });


        afterEach(function () {
            var canvasElem = document.getElementById('canvas-container');
            canvasElem.parentNode.removeChild(canvasElem);
        });

        it('should render the x-scale', function () {
            var canvasElem = jQuery(document.getElementById('xscale'));
            npScaleHelperService.scaleRenderer(canvasElem, zoom);
            var scale = canvasElem[0].getElementsByClassName('np-e-axis');
            expect(scale.length).to.be.gt(0);
        });

        it('should render the y-scale', function () {
            var canvasElem = jQuery(document.getElementById('yscale'));
            npScaleHelperService.scaleRenderer(canvasElem, zoom);
            var scale = canvasElem[0].getElementsByClassName('np-e-axis');
            expect(scale.length).to.be.gt(0);
        });

        it('scale length should be equal to the canvas width or height property', function () {
            var canvasElem = jQuery(document.getElementById('yscale'));
            npScaleHelperService.scaleRenderer(canvasElem, zoom);
            var scale = jQuery(canvasElem[0].getElementsByTagName('svg')).height();
            expect(scale).to.be.equal(1024);
        });

        it('scale length should be equal to the canvas width with zoom', function () {
            var canvasElem = jQuery(document.getElementById('yscale'));
            npScaleHelperService.scaleRenderer(canvasElem, 0.5);
            var scale = jQuery(canvasElem[0].getElementsByTagName('svg')).height();
            expect(scale).to.be.equal(512);
        });

        it('should render the highlight', function () {
            var canvasElem = jQuery(document.getElementById('yscale'));
            npScaleHelperService.scaleRenderer(canvasElem, zoom);
            npScaleHelperService.renderHighlight(selectedElement, canvasElem);
            var selectionScale = canvasElem[0].getElementsByClassName('np-e-bg-color-white');
            expect(selectionScale.length).to.be.gt(0);
        });

        it('should have the highlighted vertical scale height values same as the selected element height', function () {
            var canvasElem = jQuery(document.getElementById('yscale'));
            npScaleHelperService.scaleRenderer(canvasElem, zoom);
            npScaleHelperService.renderHighlight(selectedElement, canvasElem, 1);
            var selectionScale = canvasElem[0].getElementsByClassName('np-e-bg-color-white');
            expect(selectionScale[0].width.baseVal.value).to.be.equal(25);
            expect(selectionScale[0].height.baseVal.value).to.be.equal(100);
        });

        it('should have the highlighted horizontal scale width values same as the selected element width', function () {
            var canvasElem = jQuery(document.getElementById('xscale'));
            npScaleHelperService.scaleRenderer(canvasElem, zoom);
            npScaleHelperService.renderHighlight(selectedElement, canvasElem, 1);
            var selectionScale = canvasElem[0].getElementsByClassName('np-e-bg-color-white');
            expect(selectionScale[0].width.baseVal.value).to.be.equal(200);
            expect(selectionScale[0].height.baseVal.value).to.be.equal(25);
        });

        it('should have the highlighted vertical scale height values same as the selected element height with Zoom', function () {
            var canvasElem = jQuery(document.getElementById('yscale'));
            npScaleHelperService.scaleRenderer(canvasElem, zoom);
            npScaleHelperService.renderHighlight(selectedElement, canvasElem, 0.5);
            var selectionScale = canvasElem[0].getElementsByClassName('np-e-bg-color-white');
            expect(selectionScale[0].width.baseVal.value).to.be.equal(25);
            expect(selectionScale[0].height.baseVal.value).to.be.equal(50);
        });

        it('should have the highlighted horizontal scale width values same as the selected element width with Zoom', function () {
            var canvasElem = jQuery(document.getElementById('xscale'));
            npScaleHelperService.scaleRenderer(canvasElem, zoom);
            npScaleHelperService.renderHighlight(selectedElement, canvasElem, 0.5);
            var selectionScale = canvasElem[0].getElementsByClassName('np-e-bg-color-white');
            expect(selectionScale[0].width.baseVal.value).to.be.equal(100);
            expect(selectionScale[0].height.baseVal.value).to.be.equal(25);
        });
    });

})();
