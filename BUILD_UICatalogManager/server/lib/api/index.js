'use strict';

var UICatalogHandlers = {};

module.exports = {
	initialize: function() {
		UICatalogHandlers.uicatalogs = require('./catalog');
	},
	shutdown: function() {

	},
	getHandlers: function() {
		return UICatalogHandlers;
	}
};
