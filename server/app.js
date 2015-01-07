'use strict';

var fs = require('fs');
var path = require('path');

var commonServer = require('norman-common-server');
var tp = require("norman-server-tp");

var compression = require('compression');
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

// 2. Set configured environment variables (e.g. NODE_ENV)
if (config.env) {
    Object.keys(config.env).forEach(function (v) {
        process.env[v] = config.env[v];
    });
}

// 3. Initialize logging
commonServer.logging.configure(config.logging);

var logger = commonServer.logging.createLogger('NormanServer');
logger.info('Starting server');

// 4. Open DB connection
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
    var staticRoot;
    if (config.web) {
        staticRoot = path.resolve(config.cwd, config.web.root);
    }

    logger.info('Creating Express application');

    var app = express();
    app.use(commonServer.context.init());
    app.use(compression(config.web.compression));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser());
    if (staticRoot) {
        app.use(express.static(staticRoot, config.web.options));
    }
    app.use(morgan('dev'));
    if (config.debug) {
        app.use(require('connect-livereload')());
    }

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
