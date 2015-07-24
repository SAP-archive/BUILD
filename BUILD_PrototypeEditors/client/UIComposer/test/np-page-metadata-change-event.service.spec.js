'use strict';
(function () {
    var expect = chai.expect;
    describe('Service: np-page-metadata-change-event', function () {
        var npPageMetadataEventsMock, npPageMetadataChangeEvent;
        var eventDef = {
            controlId: 'control1',
            eventId: 'Click',
            actionId: 'ALERT',
            params: [{
                key : 'PAGE',
                value : 'S0'
            }]
        };

        beforeEach(module('uiComposer.services'));

        beforeEach(function () {

            npPageMetadataEventsMock = {
                events: {},
                broadcast: function () {}
            };

            module(function ($provide) {
                $provide.value('npPageMetadataEvents', npPageMetadataEventsMock);
            });

            inject(function ($injector) {

                npPageMetadataChangeEvent = $injector.get('npPageMetadataChangeEvent');

            });


        });

        it('should return the event metadata object for given even info', function () {
            var Md = {
                eventId: eventDef.eventId,
                actionId: eventDef.actionId,
                params: eventDef.params

            };
            var eventMd = npPageMetadataChangeEvent.getEventMdObject(eventDef);
            expect(eventMd.eventId).to.be.equal(Md.eventId);
            expect(eventMd).to.be.an('object');

        });

        it('should return the event metadata object for given even info', function () {
            var eventMd = npPageMetadataChangeEvent.getEventMdObject(eventDef);
            var controlMd = {
                events: [eventMd]
            };
            var broadcastEventSpy = sinon.spy(npPageMetadataEventsMock, 'broadcast');
            npPageMetadataChangeEvent.changeEvents(eventMd, controlMd);
            expect(broadcastEventSpy.called).to.be.equal(true);
        });

    });
})();
