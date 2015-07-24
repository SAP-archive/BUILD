'use strict';

var cluster = require('cluster');
var path = require('path');
var fs = require('fs');

var globalTunnel = require('global-tunnel');
var utils = require('./utils.js');

var Constants = require('./constants');
var MESSAGE_TYPE = Constants.MESSAGE_TYPE;
var Timeout = Constants.Timeout;
var serverLogger = require('./logger');
var common = require('node-sap-common');
var registry = common.registry;
var singleton = common.singleton;
var logging = registry.getModule('logging');
var ConfigurationMgr = common.ConfigurationManager;

var workerId = 0;

/**
 *
 * @param config must be either the path to the configuration file or a configuration object
 * @param services optional ServiceContainer with additional services
 * @constructor
 */
function Server(config, services) {
    if (config) {
        this.configure(config);
    }
    if (services) {
        this.customServices = services;
    }
}

module.exports = Server;

Server.start = function (config, services) {
    var server = new Server(config, services);
    return server.start();
};

Server.DEBUG_PORT = 5858;

Server.prototype.configure = function (serverConfig) {
    if (typeof serverConfig === 'string') {
        serverConfig = path.resolve(serverConfig);
    }
    else if (typeof serverConfig !== 'object') {
        throw new TypeError('Configuration must be a filename or an object');
    }

    serverLogger.info('Initializing server configuration');
    var configurationManager = singleton.get('config');
    if (!configurationManager) {
        configurationManager = new ConfigurationMgr();
        singleton.register('config', configurationManager);
    }

    var config = configurationManager.initialize(serverConfig);

    this._checkSessionSecret(serverConfig, config);
    this.config = config;

    if (config.env) {
        Object.keys(config.env).forEach(function (v) {
            process.env[v] = config.env[v];
        });
    }

    logging.configure(config.logging);
    if (config.http && config.http.proxy) {
        if (config.http.proxy.port) {
            serverLogger.debug('Configuring HTTP proxy for outbound calls ' + config.http.proxy.host + ':' + config.http.proxy.port);
        }
        else {
            serverLogger.debug('Configuring HTTP proxy for outbound calls ' + config.http.proxy.host);
        }
        globalTunnel.initialize(config.http.proxy);
    }

    return this;
};

Server.prototype._checkSessionSecret = function (serverConfig, config, force) {
    if (!config.session) {
        config.session = {secret: ''};
    }
    if (!config.session.secret || force) {
        config.session.secret = common.token(32);
        if (typeof serverConfig === 'string') {
            this._saveSessionSecret(serverConfig, config.session.secret);
        }
    }
};

Server.prototype._saveSessionSecret = function (configFile, secret) {
    var target = configFile;
    Promise.invoke(fs.readFile, configFile, {encoding: 'utf-8'})
        .then(function (data) {
            var rawConfig = JSON.parse(data);
            if (rawConfig.session) {
                if (typeof rawConfig.session === 'string') {
                    // Handle externalized session config
                    target = path.resolve(path.dirname(configFile), rawConfig.session);
                    rawConfig = JSON.parse(fs.readFileSync(target, {encoding: 'utf-8'}));
                    rawConfig.secret = secret;
                }
                else {
                    rawConfig.session.secret = secret;
                }
            }
            else {
                rawConfig.session = {secret: secret};
            }
            // Format JSON to be human friendly
            return Promise.invoke(fs.writeFile, target, JSON.stringify(rawConfig, null, '    '), {encoding: 'utf-8'})
                .then(function () {
                    serverLogger.debug('Session secret saved in ', target);
                });
        })
        .catch(function (err) {
            serverLogger.error(err, 'Failed to save session secret in ', target);
        });
};

Server.prototype.checkSchema = function (noExit) {
    var self = this;
    return this.startMaintenanceMode()
        .then(function () {
            return self.appServer.checkSchema();
        })
        .catch(function (error) {
            serverLogger.error(error, 'Failed to check schema');
            throw error;
        })
        .always(function () {
            return self.appServer.shutdown(noExit);
        });
};

Server.prototype.initSchema = function (noExit) {
    var self = this;
    return this.startMaintenanceMode()
        .then(function () {
            return self.appServer.initSchema();
        })
        .then(function () {
            return self.appServer.checkSchema();
        })
        .catch(function (error) {
            serverLogger.error(error, 'Failed to init schema');
            throw error;
        })
        .always(function () {
            return self.appServer.shutdown(noExit);
        });
};

Server.prototype.upgradeSchema = function (noExit) {
    var self = this;
    return this.startMaintenanceMode()
        .then(function () {
            return self.appServer.upgradeSchema();
        })
        .then(function () {
            return self.appServer.checkSchema();
        })
        .catch(function (error) {
            serverLogger.error(error, 'Failed to upgrade schema');
            throw error;
        })
        .always(function () {
            return self.appServer.shutdown(noExit);
        });
};

// Starts server without creating express app
Server.prototype.startMaintenanceMode = function () {
    var self = this;
    this.config = this.config || {};
    this.config.maintenanceMode = true;
    if (this.config.server && this.config.server.workers) {
        // Ensure that we are not running in cluster mode
        this.backupServerWorkers = this.config.server.workers;
        delete this.config.server.workers;
    }
    return self.start()
        .then(function () {
            self.config.maintenanceMode = false;
            if (self.backupServerWorkers) {
                self.config.server.workers = self.backupServerWorkers;
            }
        });
};

Server.prototype.start = function (serviceLoader) {
    var self = this;
    this.isShutdown = false;

    return new Promise(function (resolve, reject) {
        var AppServer, serverConfig, timeout, wid;

        self.config = self.config || {};
        serverConfig = self.config.server || {};
        serverConfig.name = serverConfig.name || 'AppServer';

        logging.Logger.systemFields.appServer = serverConfig.name;
        serverLogger.prepareFields();

        self.config.server = serverConfig;
        timeout = serverConfig.startupTimeout || Timeout.STARTUP;

        if (serverConfig.workers && cluster.isMaster) {
            process.title = serverConfig.name;

            self.startCluster(serverConfig.workers)
                .then(function (result) {
                    // On Windows, as console is shared, console title is changed by workers
                    process.title = serverConfig.name;
                    resolve(result);
                })
                .catch(reject);
        }
        else {
            AppServer = require('./app-server');
            self.appServer = new AppServer(self.config);
            if (serviceLoader) {
                if ((typeof serviceLoader === 'function') || (typeof serviceLoader.require === 'function')) {
                    self.appServer.serviceLoader = serviceLoader;
                }
            }
            wid = utils.setupWorker(Server.DEBUG_PORT);
            process.title = (wid ? serverConfig.name + ' - worker #' + wid : serverConfig.name);
            self.appServer.start(wid, self.customServices, self.config.maintenanceMode)
                .timeout(timeout * 1000, function () {
                    serverLogger.fatal('Server startup timeout expired');
                    return self.appServer.shutdown();
                })
                .then(resolve)
                .catch(function (error) {
                    serverLogger.error(error);
                    reject(error);
                });
        }
    });
};

Server.prototype.getClusterSettings = function () {
    var settings = this.clusterSettings;
    if (!settings) {
        settings = utils.getSettings(Server.DEBUG_PORT);
        this.clusterSettings = settings;
    }
    return settings;
};

Server.prototype.startWorker = function () {
    var self = this, settings = this.getClusterSettings(), timeout = this.getTimeout();

    return new Promise(function (resolve, reject) {
        var wid = ++workerId, timeoutId, worker;
        serverLogger.debug('Starting worker #%d', wid);

        cluster.settings.execArgv = settings.execArgv.slice();
        if (settings.debugArg) {
            cluster.settings.execArgv.push(settings.debugArg + '=' + (settings.debugPort + wid));
        }

        worker = cluster.fork({
            NORMAN_WORKER_ID: wid
        });

        worker.on('listening', function () {
        });

        worker.on('error', function (err) {
            if (timeoutId) {
                err.wid = worker.id;
                serverLogger.error(err, 'Failed to start worker #%d', worker.id);
                clearTimeout(timeoutId);
                reject(err);
            }
        });

        worker.on('online', function () {
            worker.send({type: MESSAGE_TYPE.start, config: self.config});
        });

        worker.on('message', function (message) {
            if (typeof message === 'object' && typeof message.type === 'string') {
                switch (message.type) {
                    case MESSAGE_TYPE.started:
                        self.workers[worker.id] = worker;
                        resolve(worker);
                        serverLogger.info('Worker #%d started', worker.id);
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }
                        break;
                    case MESSAGE_TYPE.startFailed:
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }
                        worker.kill();
                        reject(new Error('Startup failed for worker #' + worker.id));
                        break;
                    default :
                        serverLogger.debug({type: message.type}, 'Message not supported >> ');
                        break;
                }
            }
        });


        timeoutId = setTimeout(function () {
            var err = new Error('Startup timeout expired for worker #' + worker.id);
            err.wid = worker.id;
            timeoutId = undefined;
            try {
                serverLogger.error(err);
                reject(err);
                worker.kill();
            }
            catch (error) {
                serverLogger.error(error);
            }
        }, timeout);
    });
};

Server.prototype.startCluster = function (workerCount) {
    var self = this, serverConfig = this.config.server;

    return new Promise(function (resolve, reject) {
        // TODO : Improve log to safely handle workers
        //   silent = true was causing server freezes (on unix platforms).
        //   So we temporary set silent to false, but this should be replaced
        //   with a better log mechanism for workers.
        // var silent = !(this.config.debug && this.config.debug.active);
        var k, promises;
        var silent = false;
        var respawnInterval = (serverConfig.respawnInterval || Constants.Respawn.INTERVAL) * 1000;
        var respawnLimit = serverConfig.respawnLimit || Constants.Respawn.LIMIT;
        var respawn = 0;
        var lastRespawn = Date.now();

        serverLogger.info('Starting server cluster for ' + serverConfig.name);
        self.workers = {};

        promises = [];
        cluster.setupMaster({
            exec: path.join(__dirname, '../bin/worker.js'),
            args: [],
            silent: silent
        });

        for (k = 0; k < workerCount; ++k) {
            promises.push(self.startWorker());
        }

        Promise.waitAll(promises)
            .then(function () {
                function respawnWorker() {
                    var now = Date.now();
                    var activeWorkers = Object.keys(self.workers).length;
                    var respawnWait = lastRespawn + respawnInterval - now;
                    if (activeWorkers < workerCount) {
                        if ((respawnWait > 20) && activeWorkers) {
                            // If wait interval is almost reached or no more worker is available, respawn immediately
                            serverLogger.info('Delaying worker respawn');
                            setTimeout(respawnWorker, respawnWait);
                        }
                        else {
                            serverLogger.info('Spawning a new worker');
                            lastRespawn = now;
                            ++respawn;
                            self.startWorker();
                        }
                    }
                }

                serverLogger.info('Server cluster started');
                cluster.on('disconnect', function (worker) {
                    delete self.workers[worker.id];
                    if (!self.isShutdown) {
                        if (respawn < respawnLimit) {
                            serverLogger.error('Worker #%d terminated', worker.id);
                            respawnWorker();
                        }
                        else {
                            serverLogger.error('Worker #%d terminated, respawn limit reached', worker.id);
                            if (Object.keys(self.workers).length === 0) {
                                serverLogger.fatal('No more available worker, server shutdown');
                                setTimeout(function () {
                                    process.exit(1);  // eslint-disable-line no-process-exit
                                }, 100);
                            }
                        }
                    }
                });

                resolve(true);
            })
            .catch(function (err) {
                // Should be improved: if some workers could start we should retry starting the failed one
                var wk, errors = err.detail.errors, error;
                for (wk = 0; wk < errors.length; ++wk) {
                    error = errors[wk];
                    if (error) {
                        serverLogger.error(error, 'Failed to start worker #%d', error.wid);
                    }
                }
                Object.keys(self.workers).forEach(function (wid) {
                    self.workers[wid].kill();
                });

                reject(err);
            });
    });
};

// Compatibility with 0.3
Server.prototype.initialize = function () {
    return Promise.resolve(true);
};

Server.prototype.getTimeout = function () {
    var timeout = this.config.server.startupTimeout || Timeout.STARTUP;
    timeout *= 1000;

    return timeout;
};

Server.prototype.shutdownWorker = function (worker) {
    var timeout = this.config.server.shutdownTimeout || Timeout.SHUTDOWN;
    timeout *= 1000;
    return new Promise(function (resolve) {
        worker.send({type: MESSAGE_TYPE.stop});
        var timeoutId = setTimeout(function () {
            var err = new Error('Shutdown timeout expired for worker #' + worker.id);
            err.wid = worker.id;
            timeoutId = undefined;
            serverLogger.error(err);
            worker.kill();
        }, timeout);
        worker.on('disconnect', function () {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            resolve(true);
        });
    });
};

Server.prototype.shutdown = function (noExit) {
    var promises, self = this, workers = this.workers;
    var timeout = this.config.server.shutdownTimeout || Timeout.SHUTDOWN;
    this.isShutdown = true;

    if (workers) {
        promises = [];
        Object.keys(workers).forEach(function (wid) {
            promises.push(self.shutdownWorker(workers[wid]));
        });
        return Promise.all(promises)
            .timeout((timeout + 1) * 1000)
            .always(function () {
                if (!noExit) {
                    // Exit process
                    return Promise.delay(100).then(function () {
                        process.exit(); // eslint-disable-line no-process-exit
                    });
                }
            });
    }
    return (this.appServer ? this.appServer.shutdown(noExit) : Promise.resolve(true));
};

