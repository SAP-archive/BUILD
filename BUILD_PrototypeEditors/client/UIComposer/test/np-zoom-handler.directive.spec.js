'use strict';

(function () {

    var expect = chai.expect;

    describe('Directive: np-zoom-handler', function () {
        var elem, scope, $compile, jQuery, npConstantsMock, npFormFactorMock;
        beforeEach(module('uiComposer.uiCanvas'));
        beforeEach(module('uiComposer.uiEditor'));

        npConstantsMock = {
            zoomThreshold: {
                high: 400,
                low: 10
            },
            scale: {
                SCALESETDIMENSION: 0
            }
        };

        npFormFactorMock = {
            getCurrentFormFactor: function () {
                return {
                    width: 1280,
                    height: 1024
                };
            }
        };


        beforeEach(function () {
            module(function ($provide) {
                $provide.value('jQuery', window['norman-jquery']);
                $provide.value('npConstants', npConstantsMock);
                $provide.value('npFormFactor', npFormFactorMock);
            });
        });
        beforeEach(function () {
            inject(function ($rootScope, _$compile_, _jQuery_) {
                $compile = _$compile_;
                jQuery = _jQuery_;
                var html = '<div id ="canvas-scale-container" style="height: 1224px; width:1490px;" np-zoom-handler>' +
                    '<div class="np-e-canvas-container-inner" style="height: 1024px; width:1290px;"></div>' +
                    '<div class="np-c-container-js" style="height: 1024px; width:1290px;">' +
                    '</div></div>';

                elem = angular.element(html);
                angular.element(document.body).append(elem);

                scope = $rootScope.$new();
                elem = $compile(elem)(scope);
                scope.$digest();
            });
        });

        afterEach(function () {
            var canvasElem = document.getElementById('canvas-scale-container');
            canvasElem.parentNode.removeChild(canvasElem);
        });

        it('should respond to the fit to width event', function () {
            var spy = sinon.spy(scope, '$broadcast');
            scope.$emit('fit-width');
            expect(spy.calledWith('fit-width-value')).to.be.equal(true);
        });

        it('should broadcast a fit to width event with calculated value', function () {
            var spy = sinon.spy(scope, '$broadcast');
            scope.$emit('fit-width');
            expect(spy.calledWith('fit-width-value', {value: 112})).to.be.equal(true);
        });

        it('should broadcast a specified value if zoom level is greater than higher threshold', function () {
            var spy = sinon.spy(scope, '$broadcast');
            jQuery(document.getElementById('canvas-scale-container')).width(12000);
            scope.$emit('fit-width');

            expect(spy.calledWith('fit-width-value', {value: 400})).to.be.equal(true);
        });

        it('should broadcast a specified value if zoom level is lesser than lower threshold', function () {
            var spy = sinon.spy(scope, '$broadcast');
            jQuery(document.getElementById('canvas-scale-container')).width(20);
            scope.$emit('fit-width');
            expect(spy.calledWith('fit-width-value', {value: 10})).to.be.equal(true);
        });

    });
})();
