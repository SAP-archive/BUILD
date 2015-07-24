'use strict';

module.exports = npPageMetadataEvents;

npPageMetadataEvents.$inject = ['npEvents'];

/**
 * @ngdoc factory
 * @name npPageMetadataEvents
 * @namespace uiComposer:services:npPageMetadata:events
 */
function npPageMetadataEvents(npEvents) {
    var SERVICE_ID = 'npPageMetadataEvents';

    /**
     * @name events
     * @memberof uiComposer:services:npPageMetadata:events
     * @description Supported page metadata events.
     */
    var events = {
        controlsAdded: 'controlsAdded',
        controlsRemoved: 'controlsRemoved',
        controlsMoved: 'controlsMoved',
        controlPropertiesChanged: 'controlPropertiesChanged',
        controlsBindingChanged: 'controlsBindingChanged',
        controlEventsChanged: 'controlEventsChanged',
        mainEntityChanged: 'mainEntityChanged',
        pageChanged: 'pageChanged'
    };

    npEvents.register(SERVICE_ID, events);

    /**
     * @name broadcast
     * @memberof uiComposer:services:npPageMetadata:events
     * @description Broadcast a certain page metadata event.
     *
     * @param {string} eventName
     * @param {...*} [params]
     */
    var broadcast = npEvents.getBroadcastFn(SERVICE_ID);

    /**
     * @name listen
     * @memberof uiComposer:services:npPageMetadata:events
     * @description Register a listener for a certain page metadata event.
     *
     * @param {string} eventName
     * @param {function ()} callback
     * @returns {function ()} Function that removes the listener on execution.
     */
    var listen = npEvents.getListenFn(SERVICE_ID);

    return {
        events: events,
        broadcast: broadcast,
        listen: listen
    };
}
