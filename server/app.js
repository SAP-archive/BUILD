'use strict';

var fs = require('fs');
var path = require('path');
var multipart = require('connect-multiparty');

var commonServer = require('norman-common-server');
var tp = require("norman-server-tp");

var morgan = require('morgan');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');

var express = tp.express;
var bodyParser = tp['body-parser'];

// 1. Load configuration
var configFile = 'config.json';
if (!fs.existsSync(configFile)) {
    configFile = 'server/config.json'; // debug run
}
var config = commonServer.config.initialize(configFile);
var errors = {
    root: path.resolve(config.cwd, 'errors')
};

// 2. Initialize logging
commonServer.logging.configure(config.logging);

var logger = commonServer.logging.createLogger('NormanServer');
logger.info('Starting server');

// 3. Open DB connection
logger.info('Connecting to MongoDB');
commonServer.db.connection.initialize(config.db, config.deployment)
    .then(start, function (dbErr) {
        logger.error('Failed to connect to MongoDB: ' + dbErr.toString());
    })
    .catch(function (err) {
        logger.error('Failed to start server: ' + err.toString());
    });


function start() {
    var serviceLoader = require('./services');
    var staticRoot = path.resolve(config.cwd, config.web.root);

    logger.info('Creating Express application');

    var app = express();
    app.use(multipart());
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(express.static(staticRoot));
    app.use(morgan('dev'));
    if (config.debug) {
        app.use(require('connect-livereload')());
    }
    app.use(commonServer.context.init());

    logger.info('Loading services');
    serviceLoader.loadServices();

    logger.info('Initializing services');
    serviceLoader.initializeServices();

    logger.info('Mounting services');
    serviceLoader.initializeHandlers(app);


    // Unhandled requests below norman should return the index.html page for Angular deep-linking
    var index = path.join(staticRoot, 'index.html');
    app.use('/login', function (req, res) { res.sendFile(index); });
    app.use('/signup', function (req, res) { res.sendFile(index); });
    app.use('/norman', function (req, res) { res.sendFile(index); });


    // Return 404 if request has not been handled
    app.use(function (req, res) {
        res.statusCode = 404;
        res.sendFile(path.join(errors.root, '404.html'));
    });

    var msg = 'Starting http listener on port ' + config.http.port;
    if (config.http.hostname) {
        msg += ' for host ' + config.http.hostname;
    }
    logger.info(msg);
    var server = require('http').createServer(app);
    server.listen(config.http.port, config.http.hostname, function () {
        logger.info('Server started');
    });
}
