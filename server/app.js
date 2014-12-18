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
var errorHandler = require('composable-middleware');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var commonServer = require('norman-common-server');

// Setup DB
commonServer.db.connection.initialize(function (err) {
    if (err) {
        console.error('Error while initializing DB : ' + err);
        throw err;
    }
});


// Setup server
var app = express();

app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());

var server = require('http').createServer(app);

// Require optional modules
require('./requires.js')(app);


if (config.env === 'production') {
    config.ip = '0.0.0.0';
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

// All undefined asset or api routes should return a 404
/*app.route('/:url(api|auth|components|app|bower_components|assets)/*')
 .get(errors[404]);*/

// All other routes should redirect to the index.html
app.route('/*')
    .get(function (req, res) {
        res.sendFile(app.get('appPath') + '/index.html', {root: config.root});
    });

// Start server
server.listen(config.port, config.ip, function () {
    console.log('Express server listening on %d, in %s mode', config.port, config.env);
});
