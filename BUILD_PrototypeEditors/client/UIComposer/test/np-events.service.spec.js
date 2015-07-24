'use strict';
(function () {
    var expect = chai.expect;

    describe('Service: np-events', function () {
        var npEvents;

        beforeEach(module('uiComposer.services'));

        beforeEach(function () {
            inject(function ($injector) {
                npEvents = $injector.get('npEvents');
            });
        });

        var performRegistration = function (serviceId) {
            var registration = {
                serviceId: serviceId || 'someService',
                events: {
                    someEvent: 'someEvent'
                }
            };
            npEvents.register(registration.serviceId, registration.events);
            return registration;
        };

        describe('registration: ', function () {
            it('should provide an API to register an event service', function () {
                expect(npEvents.register).to.be.a('function');
            });

            it('should register the service if both a service id and service events were provided', function () {
                var testService = 'testService',
                    events = {
                        someEvent: 'someEvent'
                    };
                npEvents.register(testService, events);
                expect(npEvents._registeredServices).to.not.be.empty;
            });

            it('should not register the service if no service id was provided', function () {
                npEvents.register('', {
                    someEvent: 'someEvent'
                });
                expect(npEvents._registeredServices).to.be.empty;
            });

            it('should not register the service if no events were provided', function () {
                npEvents.register('someService', {});
                expect(npEvents._registeredServices).to.be.empty;
            });
        });

        describe('getBroadcastFn:', function () {
            it('should throw an error if service was not registered before trying to get broadcast function', function () {
                expect(function () {
                    npEvents.getBroadcastFn('someService');
                }).to.throw();
            });

            it('should return a broadcast function for a registered service', function () {
                var registration = performRegistration();
                expect(npEvents.getBroadcastFn(registration.serviceId)).to.be.a('function');
            });

            describe('broadcastFn:', function () {
                it('should broadcast given event with all parameters provided', function () {
                    var registration = performRegistration(),
                        broadcastFn = npEvents.getBroadcastFn(registration.serviceId),
                        listenFn = npEvents.getListenFn(registration.serviceId),
                        eventName = registration.events.someEvent,
                        cb = sinon.stub();

                    listenFn(eventName, cb);
                    broadcastFn(eventName, 1, 2, [3, 4]);

                    expect(cb.called).to.be.ok;
                    // first arg will be event object
                    expect(cb.args[0][1]).to.be.equal(1);
                    expect(cb.args[0][2]).to.be.equal(2);
                    expect(cb.args[0][3]).to.be.deep.equal([3, 4]);
                });

                it('should not broadbast anything if an unsupported event name was provided', function () {
                    var registration = performRegistration(),
                        broadcastFn = npEvents.getBroadcastFn(registration.serviceId),
                        listenFn = npEvents.getListenFn(registration.serviceId),
                        eventName = 'not-supported',
                        cb = sinon.stub();

                    expect(eventName in registration.events).to.be.false;

                    listenFn(eventName, cb);
                    broadcastFn(eventName);

                    expect(cb.called).to.be.false;
                });

                it('should create separate event scopes for different services so that events with the same name don\'t interfere', function () {
                    var registration1 = performRegistration('someService'),
                        registration2 = performRegistration('someOtherService'),
                        broadcastFn1 = npEvents.getBroadcastFn(registration1.serviceId),
                        listenFn1 = npEvents.getListenFn(registration1.serviceId),
                        listenFn2 = npEvents.getListenFn(registration2.serviceId),
                        eventName = registration1.events.someEvent,
                        cb1 = sinon.stub(),
                        cb2 = sinon.stub();

                    expect(registration1.events).to.be.deep.equal(registration2.events);

                    listenFn1(eventName, cb1);
                    listenFn2(eventName, cb2);
                    broadcastFn1(eventName);

                    expect(cb1.called).to.be.true;
                    expect(cb2.called).to.be.false;
                });

            });
        });

        describe('getListenFn:', function () {
            it('should throw an error if service was not registered before trying to get listen function', function () {
                expect(function () {
                    npEvents.getListenFn('someService');
                }).to.throw();
            });

            it('should return a listen function for a registered service', function () {
                var registration = performRegistration();
                expect(npEvents.getListenFn(registration.serviceId)).to.be.a('function');
            });

            describe('listenFn', function () {
                it('should return a function that can be used to unsubscribe from the event', function () {
                    var registration = performRegistration(),
                        broadcastFn = npEvents.getBroadcastFn(registration.serviceId),
                        listenFn = npEvents.getListenFn(registration.serviceId),
                        eventName = registration.events.someEvent,
                        cb = sinon.stub();

                    var unsubscribe = listenFn(eventName, cb);
                    broadcastFn(eventName);
                    expect(cb.called).to.be.true;

                    cb.reset();
                    unsubscribe();
                    broadcastFn(eventName);
                    expect(cb.called).to.be.false;
                });

                it('should not return anything if an unsupported event name is passed', function () {
                    var registration = performRegistration(),
                        broadcastFn = npEvents.getBroadcastFn(registration.serviceId),
                        listenFn = npEvents.getListenFn(registration.serviceId),
                        eventName = 'not-supported',
                        cb = sinon.stub();

                    expect(eventName in registration.events).to.be.false;
                    expect(listenFn(eventName, cb)).to.be.undefined;
                });
            });
        });
    });
})();
