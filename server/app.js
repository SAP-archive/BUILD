/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = {
    env: process.env.NODE_ENV,
    port: process.env.PORT || 9000,
};

var express = require('express');

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

require('../node_modules/norman-shell-server')(app);


// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
// exports = module.exports = app;
