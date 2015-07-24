'use strict';

var _ = require('norman-client-tp').lodash,
    applyKeyboardEventPolyfill = require('norman-keyboard-event-polyfill');

if (!window.KeyboardEvent.prototype.hasOwnProperty('key')) {
    applyKeyboardEventPolyfill(window);
}

/**
 * The npKeyboarder service provides an API to subscribe to certain key events with a callback function and will invoke
 * the callback when the event occurs and a custom action is applicable. Some key events should not invoke custom actions under certain conditions
 * (e.g. press of arrow key while focus is on a textfield).
 *
 * Implementation is based on DOM Level 3 KeyboardEvent key values.
 * https://dvcs.w3.org/hg/dom3events/raw-file/tip/html/DOM3Events-key.html
 *
 * Supported shortcut keys can be found in npConstants.keymap.
 * Supported modifier keys can be found in npConstants.modifierKeys.
 *
 * @namespace npKeyboarder
 */

var npKeyboarder = ['$document', '$log', 'npConstants', 'npKeyboarderHelper', 'npUserInfo',
    function ($document, $log, npConstants, npKeyboarderHelper, npUserInfo) {
        var userOS = npUserInfo.getUserOS(),
            keymap = npConstants.keymap,
            listeners = {},
            nextListenerId = 0;

        var listenersSuspended = false,
            exceptions;

        /**
         * @private
         * @description Map modifier key key values to their respective event property names.
         */
        var modifierMappings = {
            Control: 'ctrlKey',
            Alt: 'altKey',
            Meta: 'metaKey',
            Shift: 'shiftKey'
        };

        /**
         * @private
         * @returns {boolean} True if modifier keys specified for listener exactly match modifier keys present in event, false if there is no exact match.
         */
        var modifiersMatch = function (listener, event) {
            return _.every(modifierMappings, function (property, key) {
                return event[property] === _.contains(listener.modifiers, key);
            });
        };

        var checkAndExecuteListeners = function (event) {
            _.forEach(listeners, function (listener, listenerId) {
                if (!listenersSuspended || (_.isArray(exceptions) && _.contains(exceptions, _.parseInt(listenerId)))) {
                    if (event.key.toLowerCase() === listener.key && modifiersMatch(listener, event)) {
                        listener.callback(event);
                    }
                }
            });
        };

        /**
         * @name on
         * @memberof npKeyboarder
         * @description Subscribe to certain key events with a callback.
         * @param {string} key The key that should trigger the shortcut. Supported keys are npConstants.keymap.
         * @param {function} callback The callback function to invoke if key and modifierKeys match. Callback will be invoked with the keyboard event that triggered it.
         * @param {[string[]]} modifierKeys Array of strings with modifier keys that need to be pressed for key to trigger the callback.
         * Supported modifier keys are npConstants.modifierKeys. Default is no modifier keys.
         * @param {[string[]]} forOperatingSystems Optional array of operating system names for which the callback should be invoked.
         * Supported operating systems are npConstants.os. If none are specified the callback will be invoked for all operating systems.
         * @returns {number} Listener id that can be used to unsubscribe from the key event.
         */
        var on = function (key, callback, modifierKeys, forOperatingSystems) {
            key = keymap[key];
            if (!_.isString(key) || !_.isFunction(callback)) {
                $log.warn('npKeyboarder service: not registering callback due to incorrect invokation');
                return -1;
            }
            if (_.isArray(forOperatingSystems) && !_.contains(forOperatingSystems, userOS)) {
                $log.info('npKeyboarder service: not registering callback since operating system provided does not match users operating system');
                return -1;
            }
            var listenerId = nextListenerId++;
            listeners[listenerId] = {
                key: key.toLowerCase(),
                modifiers: modifierKeys,
                callback: callback
            };
            return listenerId;
        };

        /**
         * @name off
         * @memberof npKeyboarder
         * @description Unsubscribe from key events.
         * @param {number|string} listenerId Subscription id that was returned from registering a callback using the on method.
         */
        var off = function (listenerId) {
            if (_.isNumber(listenerId) || _.isString(listenerId)) {
                listenerId = listenerId.toString();
                delete listeners[listenerId];
            }
        };

        /**
         * @name bindAdditionalWindow
         * @memberof npKeyboarder
         * @description Bind key listeners to another window object (e.g. an iframe running inside the application).
         * @param {object} win The window object to bind to.
         * @returns {function} Function that removes all bound listeners on execution.
         */
        var bindAdditionalWindow = function (win) {
            if (win && win.document) {
                if (!win.KeyboardEvent.prototype.hasOwnProperty('key')) {
                    applyKeyboardEventPolyfill(win);
                }
                var $doc = angular.element(win.document);
                $doc.on('keydown', onKeyDown);
                return function () {
                    $doc.off('keydown', onKeyDown);
                };
            }
            $log.warn('npKeyboarder service: binding additional window failed. Could not attach listeners to the object that was provided.');
        };

        /**
         * @name suspendListeners
         * @memberof npKeyboarder
         * @description Suspend all registered listeners with the exception of provided ones.
         * @param {[number[]]} Optional list of listener IDs in case certain listeners should not be suspended.
         */
        var suspendListeners = function (exemptedListeners) {
            listenersSuspended = true;
            exceptions = exemptedListeners;
        };

        /**
         * @name resumeListeners
         * @memberof npKeyboarder
         * @description Resume all registered listeners.
         */
        var resumeListeners = function () {
            listenersSuspended = false;
            exceptions = undefined;
        };

        var onKeyDown = function (event) {
            if (npKeyboarderHelper.shouldPerformCustomOperation(event)) {
                checkAndExecuteListeners(event);
            }
        };

        $document.on('keydown', onKeyDown);

        return {
            on: on,
            off: off,
            bindAdditionalWindow: bindAdditionalWindow,
            suspendListeners: suspendListeners,
            resumeListeners: resumeListeners
        };
    }
];

module.exports = npKeyboarder;
