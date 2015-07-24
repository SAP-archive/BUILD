'use strict';

var commonServer = require('norman-common-server');

function getSessionKey() {
	var sessionKey;
	if (commonServer.config && commonServer.config.get('session')) {
		sessionKey = commonServer.config.get('session').secret;
	}
	return sessionKey;
}

module.exports = {
	getSessionKey: getSessionKey
};
