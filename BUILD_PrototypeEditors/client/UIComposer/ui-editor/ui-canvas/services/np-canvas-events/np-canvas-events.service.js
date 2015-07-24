'use strict';

module.exports = npCanvasEvents;

npCanvasEvents.$inject = ['npEvents'];

/**
 * @ngdoc factory
 * @name npCanvasEvents
 * @namespace npCanvasEvents
 */
function npCanvasEvents(npEvents) {
    var SERVICE_ID = 'npCanvasEvents';

    /**
     * @name events
     * @memberof npCanvasEvents
     * @description Supported canvas events.
     */
    var events = {
        controlsRendered: 'controlsRendered'
    };

    npEvents.register(SERVICE_ID, events);

    /**
     * @name broadcast
     * @memberof npCanvasEvents
     * @description Broadcast a certain canvas event.
     *
     * @param {string} eventName
     * @param {...*} [params]
     */
    var broadcast = npEvents.getBroadcastFn(SERVICE_ID);

    /**
     * @name listen
     * @memberof npCanvasEvents
     * @description Register a listener for a certain canvas event.
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
