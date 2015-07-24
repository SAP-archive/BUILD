'use strict';

var appServer = require('norman-app-server');

var path = require('path');
var config = path.join(__dirname, 'config.json');

var myServices = new appServer.ServiceContainer({});

myServices.addService('norman-auth-server', function (app) {
	require('norman-auth-server');
	app.set('appPath', '../dev');
	app.route('/*')
		.get(function (req, res) {
			res.sendFile('index.html', { root: 'dev' });
		});
}, 'none');


appServer.Server.start(config);
