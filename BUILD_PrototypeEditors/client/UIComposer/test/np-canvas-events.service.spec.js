'use strict';
(function () {
    var expect = chai.expect;

    describe('Service: np-canvas-events', function () {
        var npCanvasEvents,
            npEventsMock;

        beforeEach(module('uiComposer.uiCanvas'));

        beforeEach(function () {
            npEventsMock = {
                register: sinon.stub(),
                getBroadcastFn: sinon.stub(),
                getListenFn: sinon.stub()
            };

            module(function ($provide) {
                $provide.value('npEvents', npEventsMock);
            });

            inject(function ($injector) {
                npCanvasEvents = $injector.get('npCanvasEvents');
            });
        });

        it('should expose all events it supports', function () {
            expect(npCanvasEvents.events).to.be.an('object');
        });

        it('should register itself with the npEvents service', function () {
            expect(npEventsMock.register.called).to.be.true;
        });

        it('should pass a service id for registration', function () {
            var serviceId = npEventsMock.register.args[0][0];
            expect(serviceId).to.not.be.empty;
        });

        it('should pass all events it exposes for registration', function () {
            var events = npEventsMock.register.args[0][1];
            expect(events).to.be.deep.equal(npCanvasEvents.events);
        });

        it('should retrieve its broadcast and listen functions from the npEvents service passing its service id', function () {
            var serviceId = npEventsMock.register.args[0][0];
            expect(npEventsMock.getBroadcastFn.calledWith(serviceId)).to.be.true;
            expect(npEventsMock.getListenFn.calledWith(serviceId)).to.be.true;
        });

        it('should register itself with the npEvents service before retrieve its broadcast and listen functions', function () {
            expect(npEventsMock.register.calledBefore(npEventsMock.getBroadcastFn)).to.be.true;
            expect(npEventsMock.register.calledBefore(npEventsMock.getListenFn)).to.be.true;
        });
    });
})();
