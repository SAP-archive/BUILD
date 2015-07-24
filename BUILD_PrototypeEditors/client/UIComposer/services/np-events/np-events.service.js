'use strict';

var _ = require('norman-client-tp').lodash;

module.exports = npEvents;

npEvents.$inject = ['$rootScope', '$log'];

/**
 * @ngdoc factory
 * @name npEvents
 * @namespace npEvents
 * @description
 * Base service for all norman event services.
 */
function npEvents($rootScope, $log) {
    var service = {
        _registeredServices: {},
        register: register,
        getBroadcastFn: getBroadcastFn,
        getListenFn: getListenFn
    };

    return service;

    /**
     * @name register
     * @memberof npEvents
     *
     * @param {string} serviceId
     * @param {object} supportedEvents
     */
    function register(serviceId, supportedEvents) {
        if (_.isString(serviceId) && !_.isEmpty(serviceId) && !_.isEmpty(supportedEvents)) {
            this._registeredServices[serviceId] = {
                eventScope: $rootScope.$new(),
                supportedEvents: supportedEvents
            };
        }
    }

    /**
     * @typedef broadcastFn
     * @type {function}
     * @memberof npEvents
     *
     * @param {string} eventName
     * @param {...*} params
     */

    /**
     * @name getBroadcastFn
     * @memberof npEvents
     *
     * @param {string} serviceId
     * @returns {broadcastFn}
     */
    function getBroadcastFn(serviceId) {
        var registeredService = this._registeredServices[serviceId];
        if (!registeredService) {
            throw new Error('Need to register event service before trying to retrieve broadcast function');
        }
        return function broadcast(eventName, params) {
            eventName = registeredService.supportedEvents[eventName];
            if (eventName) {
                params = Array.prototype.slice.call(arguments);
                $log.info(serviceId + ': broadcasting event ' + eventName + ' with params: ', params);
                var eventScope = registeredService.eventScope;
                eventScope.$emit.apply(eventScope, params);
            }
            else {
                $log.warn(serviceId + ': unsupported event name provided (' + eventName + '). Supported events are: ', registeredService.supportedEvents);
            }
        };
    }

    /**
     * @typedef listenFn
     * @type {function}
     * @memberof npEvents
     *
     * @param {string} eventName
     * @param {function} callback
     * @returns {function} Function that unregisters listener.
     */

    /**
     * @name getListenFn
     * @memberof npEvents
     *
     * @param {string} serviceId
     * @returns {listenFn}
     */
    function getListenFn(serviceId) {
        var registeredService = this._registeredServices[serviceId];
        if (!registeredService) {
            throw new Error('Need to register event service before trying to retrieve listener function');
        }
        return function listen(eventName, callback) {
            eventName = registeredService.supportedEvents[eventName];
            if (eventName) {
                return registeredService.eventScope.$on(eventName, callback);
            }
        };
    }
}
