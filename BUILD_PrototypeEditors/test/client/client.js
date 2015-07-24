'use strict';

var modules = require('norman-client-tp').modules;
require('angular-mocks');
require('norman-shell-client');
require('norman-auth-client');
require('norman-projects-client');

angular.module('norman', modules);
// make some things available on window object for use in tests
window['norman-jquery'] = require('norman-jquery');
window._ = require('norman-client-tp').lodash;

window.triggerKeyEvent = function(key, type, triggerElement, modifiers) {
	var e,
		modifierMappings = {
			Control: 'ctrlKey',
			Alt: 'altKey',
			Meta: 'metaKey',
			Shift: 'shiftKey'
		};

	try {
		// sane browsers
		e = new window.KeyboardEvent(type, {
			bubbles: true,
			cancelable: true,
			ctrlKey: _.contains(modifiers, 'Control'),
			altKey: _.contains(modifiers, 'Alt'),
			metaKey: _.contains(modifiers, 'Meta'),
			shiftKey: _.contains(modifiers, 'Shift')
		});
	} catch (err) {
		// PhantomJS.......
		e = document.createEvent('HTMLEvents');
		e.initEvent(type, true, true);

		_.forEach(modifierMappings, function(modifier, k) {
			if (_.contains(modifiers, k)) {
				e[modifier] = true;
			} else {
				e[modifier] = false;
			}
		});
	}

	delete e.key;
	Object.defineProperty(e, 'key', {
		'value': key
	});

	triggerElement.dispatchEvent(e);
};

