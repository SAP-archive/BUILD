'use strict';

var config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 9000,
    ip: process.env.IP || '127.0.0.1',
    root: './'
};

var path = require('path');
var express = require('express');
var morgan = require('morgan');
var errorHandler = require('errorhandler');
var errorHandler = require('composable-middleware');

// Setup server
var app = express();
var server = require('http').createServer(app);


// // "require" all server-side modules from the root package.json in the right order (by "priority")
// var dependencies = require('../package.json').dependencies, dep, name, requireArray = [];
// for (dep in dependencies) {
//     var name = '../node_modules/' + dep + '/server';
//     requireArray.push({ name: name, priority: require(name + '/package.json').priority });
// }
// requireArray.sort(function (a, b) { return a.priority - b.priority; });
// requireArray.forEach(function (item) { require(item.name)(app); });

require('../node_modules/norman-auth-server')(app);

if (config.env === 'production') {
    // app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('appPath', config.root + '/public');
    app.use(morgan('dev'));
}

if (config.env === 'development' || config.env === 'test') {
	app.use(require('connect-livereload')());
	app.use(express.static(path.join(config.root, 'dev')));
	// app.use(express.static(path.join(config.root, 'client')));
	app.set('appPath', 'dev');
	app.use(morgan('dev'));
	app.use(errorHandler()); // Error handler - has to be last
}


// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, config.env);
});
