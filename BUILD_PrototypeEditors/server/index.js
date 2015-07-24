'use strict';
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var serviceLogger = commonServer.logging.createLogger('Prototype Editors-server');

var innerServices = [
	require('./SampleDataManager'),
	require('./DataModeler'),
	require('./PrototypeBuilder'),
	require('./Previewer'),
	require('./UIComposer'),
	require('./SharedWorkSpace')
];

module.exports = {
	initialize: function (done) {
		serviceLogger.debug('Initializing Prototype Editors services');
		innerServices.forEach(function (service) {
			serviceLogger.debug('Registering service ' + service.name);
			registry.registerModule(service, service.name);
		});
		done();
	},
	shutdown: function (done) {
		innerServices.forEach(function (service) {
			registry.unregisterModule(service.name);
		});
		done();
	},
	getHandlers: function () {
		var handlers = {};

		innerServices.forEach(function (service) {
			var serviceHandlers = service.getHandlers(), key;
			for (key in serviceHandlers) {
				if (serviceHandlers.hasOwnProperty(key)) {
					handlers[key] = serviceHandlers[key];
				}
			}
		});

		return handlers;
	},
	getInnerServices: function () {
		return innerServices;
	}
};
