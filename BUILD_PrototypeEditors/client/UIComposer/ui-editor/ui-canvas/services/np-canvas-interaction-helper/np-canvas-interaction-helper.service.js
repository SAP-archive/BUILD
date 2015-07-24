'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * The npCanvasInteractionHelper works closely together with the npCanvasInteractionHandler to handle canvas mouse events.
 * @namespace npCanvasInteractionHelper
 */
var npCanvasInteractionHelper = [function () {
    var self = {},
        listeners = [];

    /**
     * @name supportedEvents
     * @memberof npCanvasInteractionHelper
     * @description Supported canvas events.
     */
    self.supportedEvents = {
        dragstart: 'dragstart',
        dragmove: 'dragmove',
        dragend: 'dragend',
        dragenter: 'dragenter',
        dragover: 'dragover',
        dragleave: 'dragleave',
        drop: 'drop',
        click: 'click',
        dblclick: 'dblclick',
        contextmenu: 'contextmenu'
    };

    /**
     * @name triggerHandler
     * @memberof npCanvasInteractionHelper
     * @description Trigger a certain mouse event. Supported events are npCanvasInteractionHelper.supportedEvents.
     * @param {string} evtName Name of the event that should be triggered.
     * @param {boolean} inCanvas Wether the event occured within canvas bounds.
     * @param {Event} evt The original mouse event that triggered this event.
     * @returns {function} Function that removes the listener on execution.
     */
    self.triggerHandler = function (evtName, inCanvas, evt) {
        evtName = self.supportedEvents[evtName];
        if (!evtName || typeof inCanvas === 'undefined' || typeof evt !== 'object') {
            return;
        }

        _.forEach(listeners, function (listener) {
            if (listener.evtName === evtName) {
                if (!listener.onlyCanvasEvent || inCanvas) {
                    listener.cb(evt);
                }
            }
        });
    };

    /**
     * @name on
     * @memberof npCanvasInteractionHelper
     * @description Subscribe to a certain mouse event. Supported events are npCanvasInteractionHelper.supportedEvents.
     * @param {string} evtName Name of the event that should be subscribed to.
     * @param {function} cb Callback function that should be executed when the event occurs. It will be executed with the original mouse event as its first parameter. The original event has 2 additional parameters, canvasX and canvasY, which contain the mouse position relative to the canvas.
     * @param {boolean} [onlyCanvasEvent=false] Wether the event needs to occur within canvas bounds for the callback to be executed.
     * @returns {function} Function removes the listener on execution.
     */
    self.on = function (evtName, cb, onlyCanvasEvent) {
        evtName = self.supportedEvents[evtName];
        if (!evtName || typeof cb !== 'function') {
            return undefined;
        }

        var listener = {
            evtName: evtName,
            cb: cb,
            onlyCanvasEvent: !!onlyCanvasEvent
        };
        listeners.push(listener);

        return function () {
            _.remove(listeners, function (l) {
                return l === listener;
            });
        };
    };

    return self;
}
];

module.exports = npCanvasInteractionHelper;
