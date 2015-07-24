'use strict';

var config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 9015,
    ip: process.env.IP || '127.0.0.1',
    root: './'
};

var path = require('path');
var express = require('norman-server-tp').express; 
var bodyParser = require('norman-server-tp')['body-parser'];

// Setup server
var app = express();

app.use(bodyParser.json());

var server = require('http').createServer(app);

// Require optional modules
var commonServer = require('norman-common-server');

// Setup DB
commonServer.db.connection.initialize({database: 'norman-uiCatalog-manager-rest-test'}, function (err) {
    if (err) {
        console.error("Error while initializing DB : " + err);
        process.exit(1);
    }
});
require('norman-auth-server')(app);

require('../server/index.js')(app);

// All other routes should redirect to the index.html
app.route('/*')
    .get(function (req, res) {
        res.sendFile(app.get('appPath') + '/index.html', { root: config.root });
    });

// Start server
server.listen(config.port, config.ip, function () {
    console.log('Express server listening on %d, in %s mode', config.port, config.env);
});


module.exports = app;