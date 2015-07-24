'use strict';
(function () {

    var expect = chai.expect;

    var triggerMouseEvent = function (eventType, target, pageX, pageY) {
        var evt = document.createEvent('MouseEvent');
        evt.initMouseEvent(eventType, true, true, window, null, 0, 0, pageX, pageY, false, false, false, false, 0, null);
        target.dispatchEvent(evt);
    };

    describe('Directive: np-canvas-interaction-handler', function () {
        var elem, scope,
            $document, npCanvasInteractionHelper;

        beforeEach(module('uiComposer.uiCanvas'));

        beforeEach(function () {
            var npZoomHelperMock = {
                getZoomLevel: function () {
                    return 1;
                }
            };

            var npFormFactorMock = {
                getCurrentFormFactor: function () {
                    return {
                        height: '400px',
                        width: '600px'
                    };
                }
            };

            module(function ($provide) {
                $provide.value('npZoomHelper', npZoomHelperMock);
                $provide.value('npFormFactor', npFormFactorMock);
            });

            inject(function ($rootScope, $compile, _$document_, _npCanvasInteractionHelper_) {
                $document = _$document_;
                npCanvasInteractionHelper = _npCanvasInteractionHelper_;
                elem = angular.element('<div np-canvas-interaction-handler></div>');
                scope = $rootScope.$new();
                elem = $compile(elem)(scope);
                scope.$apply();
            });
        });

        beforeEach(function () {
            sinon.stub(elem[0], 'getBoundingClientRect', function () {
                return {
                    top: 100,
                    left: 200
                };
            });
        });

        afterEach(function () {
            typeof npCanvasInteractionHelper.triggerHandler.restore === 'function' && npCanvasInteractionHelper.triggerHandler.restore();
        });

        it('should trigger the dragstart event if a mousedown is followed by a mousemove event', function () {
            var spy = sinon.spy(npCanvasInteractionHelper, 'triggerHandler');
            triggerMouseEvent('mousedown', $document[0]);
            triggerMouseEvent('mousemove', $document[0]);
            expect(spy.calledWith('dragstart')).to.be.equal(true);
            triggerMouseEvent('mouseup', $document[0]);
        });

        it('should trigger the dragmove event on subsequent mousemove events', function () {
            var spy = sinon.spy(npCanvasInteractionHelper, 'triggerHandler');
            triggerMouseEvent('mousedown', $document[0]);
            triggerMouseEvent('mousemove', $document[0]);
            expect(spy.calledWith('dragstart')).to.be.equal(true);
            triggerMouseEvent('mousemove', $document[0]);
            expect(spy.calledWith('dragmove')).to.be.equal(true);
            triggerMouseEvent('mouseup', $document[0]);
        });

        it('should trigger the dragend event on mouseup if it was preceeded by a dragstart', function () {
            var spy = sinon.spy(npCanvasInteractionHelper, 'triggerHandler');
            triggerMouseEvent('mousedown', $document[0]);
            triggerMouseEvent('mousemove', $document[0]);
            expect(spy.calledWith('dragstart')).to.be.equal(true);
            triggerMouseEvent('mouseup', $document[0]);
            expect(spy.calledWith('dragend')).to.be.equal(true);
        });

        it('should trigger the click event on mouseup if it directly follows mousedown (no mousemove inbetween)', function () {
            var spy = sinon.spy(npCanvasInteractionHelper, 'triggerHandler');
            triggerMouseEvent('mousedown', $document[0]);
            triggerMouseEvent('mouseup', $document[0]);
            expect(spy.calledWith('click')).to.be.equal(true);
        });

        it('should not trigger the click event on mouseup if a mousemove occured after mousedown', function () {
            var spy = sinon.spy(npCanvasInteractionHelper, 'triggerHandler');
            triggerMouseEvent('mousedown', $document[0]);
            triggerMouseEvent('mousemove', $document[0]);
            triggerMouseEvent('mouseup', $document[0]);
            expect(spy.calledWith('click')).to.be.equal(false);
        });

        // TODO: fix those 2 tests
        // it('should trigger handlers with an additional flag that is true if the event happened within canvas bounds', function () {
        //     $document.append(elem);
        //     var spy = sinon.spy(npCanvasInteractionHelper, 'triggerHandler');
        //     triggerMouseEvent('mousedown', elem[0]);
        //     triggerMouseEvent('mouseup', elem[0]);
        //     expect(spy.calledWith('click', false)).to.be.equal(true);
        //     // elem[0].classList.add('np-c-canvas-overlay-js');
        //     // triggerMouseEvent('mousedown', elem[0]);
        //     // triggerMouseEvent('mouseup', elem[0]);
        //     // expect(spy.calledWith('click', true)).to.be.equal(true);
        // });

        // it('should attach some canvas information to each triggered event', function () {
        //     var evt;
        //     var cb = function (_evt_) {
        //         evt = _evt_;
        //     };
        //     npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.click, cb);
        //     triggerMouseEvent('mousedown', $document[0]);
        //     triggerMouseEvent('mouseup', $document[0], 300, 300);
        //     expect(evt).to.be.an('object');
        //     expect(evt.canvasX).to.be.equal(100); // pageX - offset.left
        //     expect(evt.canvasY).to.be.equal(200); // pageY - offset.top
        //     expect(evt.canvasHeight).to.be.equal(400);
        //     expect(evt.canvasWidth).to.be.equal(600);
        // });

    });
})();
