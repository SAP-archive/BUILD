'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-canvas-interaction-helper', function () {
        var npCanvasInteractionHelper;

        beforeEach(module('uiComposer.uiCanvas'));

        beforeEach(inject(function (_npCanvasInteractionHelper_) {
            npCanvasInteractionHelper = _npCanvasInteractionHelper_;
        }));

        it('should support a number of events', function () {
            expect(npCanvasInteractionHelper.supportedEvents).to.be.an('object');
            expect(npCanvasInteractionHelper.supportedEvents).to.have.property('dragstart');
            expect(npCanvasInteractionHelper.supportedEvents).to.have.property('dragmove');
            expect(npCanvasInteractionHelper.supportedEvents).to.have.property('dragend');
            expect(npCanvasInteractionHelper.supportedEvents).to.have.property('click');
            expect(npCanvasInteractionHelper.supportedEvents).to.have.property('dblclick');
        });

        it('should allow subscription for certain events and trigger their callback when the event occurs, passing it the original event', function () {
            var stub = sinon.stub(),
                evt = {
                    id: 0
                };
            npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.click, stub);
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.click, true, evt);
            expect(stub.calledWith(evt)).to.be.equal(true);
        });

        it('should allow subscription to canvas events only', function () {
            var stub = sinon.stub();
            npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.click, stub, true);
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.click, false, {});
            expect(stub.called).to.be.equal(false);
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.click, true, {});
            expect(stub.called).to.be.equal(true);
        });

        it('should execute the callback for a certain event multiple times if the events occurs multiple times', function () {
            var stub = sinon.stub(),
                callcount = 3;
            npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.click, stub);
            for (var i = 0; i < callcount; ++i) {
                npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.click, true, {});
            }
            expect(stub.callCount).to.be.equal(callcount);
        });

        it('should return a function on subscription that allows clients to remove the listener', function () {
            var stub = sinon.stub(),
                listener = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.click, stub);
            expect(listener).to.be.a('function');
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.click, true, {});
            expect(stub.calledOnce).to.be.equal(true);
            listener();
            npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.click, true, {});
            expect(stub.calledOnce).to.be.equal(true);
        });

    });
})();
