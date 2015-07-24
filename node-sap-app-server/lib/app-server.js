'use strict';

var path = require('path');
var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var compression = require('compression');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var common = require('node-sap-common');
var registry = common.registry;
var logging = registry.getModule('logging');
var db = require('node-sap-mongo');

var express = require('./express.js');
var bodyParser = require('body-parser');

var ServiceContainer = require('./service-container');
var constants = require('./constants');
var ServerStatus = constants.ServerStatus;
var Timeout = constants.Timeout;
var serverLogger = require('./logger');

function AppServer(config) {
    EventEmitter.call(this);
    this._status = ServerStatus.STOPPED;
    this.config = config || {};
    this.config.server = this.config.server || {};
    this.wid = config.wid;
}

util.inherits(AppServer, EventEmitter);
module.exports = AppServer;

function getTimeout(timeout, defaultTimeout) {
    timeout = timeout || defaultTimeout;
    return (timeout * 1000);
}

Object.defineProperties(AppServer.prototype, {
    status: {
        get: function () {
            return this._status;
        }
    },
    starting: {
        get: function () {
            return this._starting;
        }
    },
    stopping: {
        get: function () {
            return this._starting;
        }
    }
});

function setServerStatus(server, status) {
    if (status !== server._status) {
        server._status = status;
        try {
            server.emit(status);
        }
        catch (err) {
            serverLogger.warn(err, 'Exception from AppServer event listener');
        }
    }
}

AppServer.prototype.serviceLoader = require('./loader');

AppServer.prototype.start = function (wid, customServices, maintenanceMode) {
    var self = this;

    wid = wid || this.wid;

    switch (this._status) {
        case ServerStatus.STARTING:
        case ServerStatus.STARTED:
            return this._starting;
        case ServerStatus.STOPPING:
            return Promise.reject(new Error('Server is stopping'));
    }

    common.registry.unregisterModule('AppServer');
    common.registry.registerModule(this, 'AppServer');

    if (wid) {
        this.wid = wid;
        logging.Logger.systemFields.wid = wid;
        serverLogger.prepareFields();
        serverLogger.info('Starting server on worker #' + wid);
    }
    else {
        serverLogger.info('Starting server');
    }

    setServerStatus(this, ServerStatus.STARTING);

    this._starting = this.initialize(customServices, maintenanceMode)
        .then(function () {
            if (!maintenanceMode) {
                self.checkStartupAbort();
                return self.startApplication();
            }
        })
        .then(function () {
            if (self._status === ServerStatus.STARTING) {
                setServerStatus(self, ServerStatus.STARTED);
            }
            return self;
        })
        .catch(function (err) {
            self._status = ServerStatus.STARTED;
            serverLogger.error(err, 'Failed to start server');
            return Promise.delay(100)
                .then(function () {
                    return self.shutdown();
                }).always(function () {
                    throw err;
                });
        });
    return this._starting;
};

AppServer.prototype.checkStartupAbort = function () {
    if (this._abort && (this._status === ServerStatus.STARTING)) {
        throw new Error('Startup abort requested');
    }
};

AppServer.prototype.abortStartup = function (noExit) {
    var self = this;
    serverLogger.warn('Aborting server startup');
    var timeout = getTimeout(this.config.server.abortTimeout, Timeout.ABORT_STARTUP);
    this._abort = true;
    this._stopping = this._starting.timeout(timeout, new Error('Startup abort requested')).always(function () {
        return self.shutdown(noExit);
    });
};

AppServer.prototype.shutdown = function (noExit) {
    var wid = this.wid, self = this;
    switch (this._status) {
        case ServerStatus.STOPPED:
            return Promise.resolve(true);
        case ServerStatus.STARTING:
            if (!this._abort) {
                return this.abortStartup(noExit);
            }
            break;
        case ServerStatus.STOPPING:
            return this._stopping;
    }
    if (wid) {
        serverLogger.info('Stopping server on worker #' + wid);
    }
    else {
        serverLogger.info('Stopping server');
    }
    setServerStatus(this, ServerStatus.STOPPING);
    this._abort = false;
    this._starting = undefined;
    //  1. stop http server
    this._stopping = this.stopApplication()
        .always(function () {
            //  2. shutdown services
            serverLogger.debug('Stopping services');
            return self.serviceContainer ? self.serviceContainer.shutdownServices() : Promise.resolve(true);
        })
        .timeout(getTimeout(this.config.server.serviceShutdownTimeout, Timeout.SERVICE_SHUTDOWN))
        .always(function () {
            //  3. disconnect db (shutdown core services)
            if (db && db.connection && typeof db.connection.disconnect === 'function') {
                db.connection.disconnect();
            }
        })
        .timeout(getTimeout(this.config.server.shutdownTimeout, Timeout.SHUTDOWN))
        .always(function () {
            if (self.wid) {
                serverLogger.info('Server stopped on worker #' + wid);
            }
            else {
                serverLogger.info('Server stopped');
            }
            self.serviceContainer = undefined;
            setServerStatus(self, ServerStatus.STOPPED);

            // logging shutdown to add

            if (!noExit) {
                // Exit process
                return Promise.delay(100).then(function () {
                    process.exit(); // eslint-disable-line no-process-exit
                });
            }
        });
    return this._stopping;
};

AppServer.prototype.checkSchema = function () {
    var self = this;
    serverLogger.debug('check schema');

    return self.serviceContainer.checkSchema()
        .then(function () {
            return self.serviceContainer.onSchemaChecked();
        })
        .catch(function (error) {
            serverLogger.error(error, 'error in check schema');
            throw error;
        });
};

AppServer.prototype.initSchema = function () {
    var self = this;
    serverLogger.debug('init schema');

    return self.serviceContainer.initializeSchema()
        .then(function () {
            return self.serviceContainer.onSchemaInitialized();
        })
        .catch(function (error) {
            serverLogger.error(error, 'error in initialize schema');
            throw error;
        });
};

AppServer.prototype.upgradeSchema = function () {
    var self = this;
    serverLogger.debug('upgrade schema');

    return self.serviceContainer.prepareSchemaUpgrade()
        .then(function () {
            return self.serviceContainer.upgradeSchema();
        })
        .then(function () {
            return self.serviceContainer.onSchemaUpgraded();
        })
        .catch(function (error) {
            serverLogger.error(error, 'error in upgrade schema');
            throw error;
        });
};

AppServer.prototype.initialize = function (customServices, maintenanceMode) {
    var serviceContainer, self = this;
    try {
        serverLogger.debug('Initializing server');
        serviceContainer = new ServiceContainer(this.config.services);
        serviceContainer.serviceLoader = this.serviceLoader;
        this.serviceContainer = serviceContainer;
        if (customServices) {
            serviceContainer.addServices(customServices);
        }
    }
    catch (error) {
        return Promise.reject(error);
    }

    return this.dbConnect()
        .then(function () {
            self.checkStartupAbort();
            return serviceContainer.loadServices();
        })
        .then(function () {
            self.checkStartupAbort();
            return serviceContainer.initializeServices();
        })
        .then(function () {
            self.checkStartupAbort();
            return serviceContainer.onInitialized();
        })
        .then(function () {
            if (!maintenanceMode) {
                self.checkStartupAbort();
                return self.initializeApplication();
            }
        })
        .then(function () {
            serverLogger.debug('Server initialized');
        });
};

AppServer.prototype.startApplication = function () {
    var self = this;
    serverLogger.debug('Starting application');

    return new Promise(
        function (resolve, reject) {
            if (self.config.http) {
                var server, httpConfig = self.config.http;
                serverLogger.debug('Mounting Not Found handlers');
                self.mountNotFoundHandlers();

                var msg = 'Starting http server on port ' + httpConfig.port;
                if (httpConfig.hostname) {
                    msg += ' for host ' + httpConfig.hostname;
                }
                serverLogger.debug(msg);
                server = self.createServer();
                self.httpServer = server;
                server.listen(httpConfig.port, httpConfig.hostname, function () {
                    serverLogger.info('Server started');
                    resolve(true);
                });
                server.on('error', function (serverError) {
                    serverLogger.error(serverError, 'Failed to start http server');
                    reject(serverError);
                });
            }
            else {
                resolve();
            }
        })
        .catch(function (err) {
            serverLogger.error(err, 'Failed to start application');
            throw err;
        });
};

AppServer.prototype.stopApplication = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        if (self.httpServer) {
            var timeout = getTimeout(self.config.server.httpShutdownTimeout, Timeout.HTTP_SHUTDOWN);

            serverLogger.debug('Stopping http server');

            new Promise(
                function (done) {
                    self.httpServer.close(done);
                })
                .then(function () {
                    serverLogger.debug('http server stopped');
                    resolve(true);

                })
                .timeout(timeout, function () {
                    serverLogger.warn('http shutdown timed out, forcing shutdown');
                    resolve(false);
                })
                .catch(reject);
        }
        else {
            resolve(true);
        }
    });
};

AppServer.prototype.dbConnect = function () {
    var self = this;
    serverLogger.debug('Connecting to MongoDB');
    return new Promise(function (resolve, reject) {
        if (self.config.db && self.config.deployment) {
            db.connection.initialize(self.config.db, self.config.deployment)
                .then(resolve)
                .catch(function (dbErr) {
                    serverLogger.error(dbErr, 'Failed to connect to MongoDB');
                    reject(dbErr);
                });
        }
        else {
            resolve();
        }
    });
};

AppServer.prototype.initializeApplication = function () {
    var self = this;
    try {
        serverLogger.debug('Creating Express application');
        this.createExpressApp();
    }
    catch (err) {
        serverLogger.error(err, 'Failed to create Express application');
        return Promise.reject(err);
    }
    return this.serviceContainer.mountFilters(this.app).then(function () {
        return self.serviceContainer.mountHttpHandlers(self.app);
    });
};

AppServer.prototype.createExpressApp = function () {
    var config = this.config;
    var webConfig = config.web || {};
    var expressConfig = (config.http && config.http.express) || {};
    var staticRoot;
    var httpLogger = logging.createLogger('http');
    var loggingOptions = (config.logging && config.logging.http);
    var app = express();
    var jsonOptions = webConfig['body-parser'];
    jsonOptions = jsonOptions && jsonOptions.json;
    this.app = app;
    if (expressConfig.app) {
        Object.keys(expressConfig.app).forEach(function (key) {
            var value = expressConfig.app[key];
            serverLogger.debug('Setting Express app option: ' + key + ' = ' + value);
            app.set(key, value);
        });
    }
    app.use(common.context.init());
    if (webConfig.root) {
        staticRoot = path.resolve(config.cwd, config.web.root);
    }
    if (webConfig.compression) {
        app.use(compression(webConfig.compression));
    }
    app.use(cookieParser());
    app.use(logging.http.requestLogger(httpLogger, loggingOptions));
    app.use(bodyParser.json(jsonOptions));
    app.use(methodOverride());
    if (staticRoot) {
        app.use(express.static(staticRoot, webConfig.options));
    }

    if (config.debug && config.debug.active) {
        this.setDebugMode();
    }
};

AppServer.prototype.setDebugMode = function () {
    var liveReload;
    var debugConfig = this.config.debug;
    var app = this.app;

    // report stack traces to client
    common.CommonError.debugMode = true;

    // live-reload
    if (debugConfig.liveReload) {
        liveReload = require('connect-livereload');
        debugConfig.liveReload.forEach(function (location) {
            serverLogger.debug('Enabling live-reload on ' + location);
            app.use(location, liveReload());
        });
    }
};

AppServer.prototype.mountNotFoundHandlers = function () {
    var config = this.config, app = this.app;
    var staticRoot, index, errors;

    if (config.web && config.web.root) {
        staticRoot = path.resolve(config.cwd, config.web.root);
        if (config.web.errors && config.web.errors.root) {
            errors = path.resolve(config.cwd, config.web.errors.root);
        }

        // Return index.html page for Angular deep-linking on configured routes
        if (config.web.indexFallback) {
            index = path.join(staticRoot, 'index.html');
            config.web.indexFallback.forEach(function (location) {
                app.use(location, function (req, res) {
                    res.sendFile(index);
                });
            });
        }

        // Return custom 404
        if (errors) {
            app.use(function (req, res) {
                res.statusCode = 404;
                res.sendFile(path.join(errors, '404.html'));
            });
        }
    }

    // Return raw 404
    app.use(function (req, res) {
        res.statusCode = 404;
        res.end();
    });
};

AppServer.prototype.createServer = function () {
    var tlsConfig = this.config.http;
    tlsConfig = tlsConfig && tlsConfig.tls;
    return (tlsConfig ? this.createHttpsServer(tlsConfig) : this.createHttpServer());
};

AppServer.prototype.createHttpServer = function () {
    var server;
    serverLogger.debug('Creating http server');
    server = require('http').createServer(this.app);
    this.server = server;
    return server;
};

AppServer.prototype.createHttpsServer = function (tlsConfig) {
    var cwd, https, tlsOptions, certs;
    serverLogger.debug('Creating https server');
    https = require('https');
    tlsOptions = util._extend({}, tlsConfig);

    // Remove unsupported options
    delete tlsOptions.cwd;
    delete tlsOptions.NPNProtocols;
    delete tlsOptions.SNICallback;

    // Load certificates
    cwd = tlsConfig.cwd;
    if (cwd) {
        cwd = path.resolve(this.config.cwd, cwd);
    }
    else {
        cwd = this.config.cwd;
    }
    if (tlsConfig.pfx) {
        tlsOptions.pfx = fs.readFileSync(path.resolve(cwd, tlsConfig.pfx));
    }
    else if (tlsConfig.key) {
        tlsOptions.key = fs.readFileSync(path.resolve(cwd, tlsConfig.key));
        if (tlsConfig.cert) {
            tlsOptions.cert = fs.readFileSync(path.resolve(cwd, tlsConfig.cert));
        }
        else {
            throw new Error('Missing server certificate, you must set either pfx or cert option');
        }
    }
    else {
        throw new Error('Missing private key, you must set either pfx or key option');
    }

    certs = tlsConfig.crl;
    if (certs) {
        if (typeof certs === 'string') {
            tlsOptions.crl = [fs.readFileSync(path.resolve(cwd, certs))];

        }
        else {
            tlsOptions.crl = [];
            certs.forEach(function (cert) {
                tlsOptions.crl.push(fs.readFileSync(path.resolve(cwd, cert)));
            });
        }
    }

    if (tlsConfig.requestCert) {
        certs = tlsConfig.ca;
        if (certs) {
            if (typeof certs === 'string') {
                tlsOptions.ca = [fs.readFileSync(path.resolve(cwd, certs))];

            }
            else {
                tlsOptions.ca = [];
                certs.forEach(function (cert) {
                    tlsOptions.ca.push(fs.readFileSync(path.resolve(cwd, cert)));
                });
            }
        }
        else if (!tlsOptions.pfx) {
            throw new Error('Trusted Certificate Authorities must be explicitly defined, you must set either pfx or ca option');
        }
    }

    return https.createServer(tlsOptions, this.app);
};
