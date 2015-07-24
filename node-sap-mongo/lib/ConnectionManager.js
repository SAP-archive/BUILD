'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var path = require('path');
var fs = require('fs');

var mongoose = require('mongoose');

var data = require('node-sap-common').data;

var dbConnectionLogger = {
    info: function () {
    },
    error: function () {
    },
    debug: function () {
    },
    warn: function () {
    }
};


var Status = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    DISCONNECTING: 'disconnecting'
};

var DB_CLOSE_TIMEOUT = 30;

function ConnectionManager() {
    var self = this;
    EventEmitter.call(this);
    this._status = Status.DISCONNECTED;
    this._connected = false;
    this._connectionErrorHandler = function (error) {
        self.onConnectionError(error);
    };
}
util.inherits(ConnectionManager, EventEmitter);
module.exports = ConnectionManager;

module.exports.setLogger = function (logger) {
    dbConnectionLogger = logger;
};

module.exports.getLogger = function () {
    return dbConnectionLogger;
};

ConnectionManager.Status = Status;

Object.defineProperties(ConnectionManager.prototype, {
    disconnecting: {
        get: function () {
            return this._disconnecting;
        }
    },
    connected: {
        get: function () {
            return this._connected;
        }
    },
    connecting: {
        get: function () {
            return this._connecting;
        }
    },
    status: {
        get: function () {
            return this._status;
        }
    }
});

// cf. http://mongodb.github.io/node-mongodb-native/1.4/driver-articles/mongoclient.html
var defaultConnection = {
    hosts: 'localhost',
    database: 'norman',
    urlParams: {},
    options: {
        db: {
            w: 1
        }
    }
};
var defaultDeployment = {
    strategy: 'single'
};

function setStatus(manager, status) {
    if (status !== manager._status) {
        manager._status = status;
        process.nextTick(function () {
            try {
                manager.emit(status);
            }
            catch (err) {
                dbConnectionLogger.error(err);
            }
        });
    }
}

// Patch Mongo DB driver to avoid crashing the server when ignoring errors
var mongoPatched = false;
function patchMongo() {
    if (mongoPatched) {
        return;
    }
    var baseProto = Object.getPrototypeOf(mongoose.mongo.Server.prototype);
    baseProto._callHandler = function (id, document, err) {
        // If there is a callback peform it
        if (this._callBackStore.listeners(id).length >= 1) {
            // Get info object
            var info = this._callBackStore._notReplied[id];
            // Delete the current object
            delete this._callBackStore._notReplied[id];
            // Call the handle directly don't emit
            var callback = this._callBackStore.listeners(id)[0].listener;
            // Remove the listeners
            this._callBackStore.removeAllListeners(id);
            // Force key deletion because it nulling it not deleting in 0.10.X
            if (this._callBackStore._events) {
                delete this._callBackStore._events[id];
            }

            try {
                // Execute the callback if one was provided
                if (typeof callback === 'function') {
                    callback(err, document, info.connection);
                }
            }
            catch (error) {
                dbConnectionLogger.error(error);
            }
        }
    };
    mongoPatched = true;
}
patchMongo();

ConnectionManager.prototype.initialize = function (connection, deployment, done) {
    var self = this;
    if (typeof deployment === 'function') {
        done = deployment;
        deployment = undefined;
    }

    switch (this._status) {
        case Status.CONNECTING:
            return Promise.reject(new Error('Connection in process')).callback(done);
        case Status.CONNECTED:
            return Promise.reject(new Error('Already connected')).callback(done);
        case Status.DISCONNECTING:
            return this._disconnecting.then(function () {
                return self.initialize(connection, deployment, done);
            });
    }
    try {
        this.connection = ConnectionManager.getConnectionParameters(connection);
        this.deployment = ConnectionManager.getDeploymentParameters(deployment, connection.database);
    }
    catch (configError) {
        this.connection = undefined;
        this.deployment = undefined;
        dbConnectionLogger.error(configError, 'Invalid configuration');
        return Promise.reject(configError).callback(done);
    }
    dbConnectionLogger.info('Connecting to Mongo DB database ' + this.connection.database + ' on ' + this.connection.hosts);
    setStatus(this, Status.CONNECTING);
    this._disconnecting = undefined;
    this._connecting = new Promise(function (resolve, reject) {
        var dbError;
        self.dbConnections = {};
        self.main = mongoose.createConnection(self.connection.uri, self.connection.options);
        self.main.once('connected', function () {
            if (self.main) {
                dbConnectionLogger.info('Connected to Mongo DB');
                self._connected = true;
                setStatus(self, Status.CONNECTED);
                self.main.on('error', self._connectionErrorHandler);
                resolve(true);
            }
            else {
                self._connected = false;
                setStatus(self, Status.DISCONNECTED);
                dbError = new Error('Connection failed');
                dbConnectionLogger.warn(dbError, 'Failed to connect to Mongo DB');
                reject(dbError);
            }
        });
        self.main.once('error', function (err) {
            self.main = undefined;
            self._connected = false;
            setStatus(self, Status.DISCONNECTED);
            dbConnectionLogger.warn(err, 'Failed to connect to Mongo DB');
            reject(err);
        });
        if ((self.deployment.strategy === 'single') && (self.deployment.database === connection.database)) {
            self.dbConnections[self.deployment.database] = self.main;
        }
    });

    return this._connecting.callback(done);
};

ConnectionManager.prototype.disconnect = function (done) {
    var self = this;
    switch (this._status) {
        case Status.DISCONNECTED:
            return Promise.resolve(true).callback(done);
        case Status.CONNECTING:
            return this._connecting.always(function () {
                return self.disconnect();
            }).callback(done);
        case Status.DISCONNECTING:
            return this._disconnecting.callback(done);
    }
    dbConnectionLogger.info('Disconnecting from Mongo DB');
    this._connected = false;
    this._connecting = undefined;
    setStatus(this, Status.DISCONNECTING);
    this._disconnecting = Promise.invoke(this.main, 'close')
        .timeout(DB_CLOSE_TIMEOUT)
        .always(function (err) {
            if (err) {
                dbConnectionLogger.warn(err, 'Error while closing connection');
            }
            dbConnectionLogger.info('Disconnected from Mongo DB');
            resetMongoose();
            setStatus(self, Status.DISCONNECTED);
        });
    this.main = undefined;
    this.dbConnections = {};
    return this._disconnecting.callback(done);
};

ConnectionManager.prototype.getMongooseConnection = function (name) {
    if (!this._connected) {
        throw new Error('Connection not initialized');
    }
    var dbName = this.getDbName(name);
    var connection = this.dbConnections[dbName];
    if (!connection) {
        connection = this.main.useDb(dbName);
        this.dbConnections[dbName] = connection;
    }
    return connection;
};

ConnectionManager.prototype.getDb = function (name) {
    return this.getMongooseConnection(name).db;
};

ConnectionManager.prototype.getDbName = function (name) {
    var dbName, deployment = this.deployment;
    if (!this._connected) {
        throw new Error('Connection not initialized');
    }
    switch (deployment.strategy) {
        case 'distribute':
            dbName = deployment.prefix + name;
            break;
        case 'map':
            dbName = deployment.map[name] || (deployment.prefix + name);
            break;
        default:
            dbName = deployment.database;
            break;
    }
    return dbName;
};

ConnectionManager.getConnectionParameters = function (connection) {
    var k, n, key, keys, next, uri, serverOptions, username;
    connection = data.extend({}, defaultConnection, connection);

    uri = 'mongodb://';
    username = connection.username || connection.user;
    if (username) {
        uri += username + ':' + (connection.password || '') + '@';
    }
    uri += connection.hosts;
    if (connection.database) {
        uri += '/' + connection.database;
    }
    if (connection.urlParams) {
        keys = Object.keys(connection.urlParams);
        n = keys.length;
        for (k = 0; k < n; ++k) {
            key = keys[k];
            uri += (next ? '&' : '?');
            uri += key + '=' + connection.urlParams[key];
            next = true;
        }
    }
    serverOptions = connection.options && connection.options.server;
    if (serverOptions && serverOptions.ssl) {
        ConnectionManager.processSSLConfig(serverOptions);
    }
    return {
        hosts: connection.hosts,
        database: connection.database,
        uri: uri,
        options: connection.options
    };
};

ConnectionManager.getDeploymentParameters = function (deployment, database) {
    deployment = data.extend({}, defaultDeployment, deployment);
    deployment.database = deployment.database || database;
    switch (deployment.strategy) {
        case 'distribute':
            deployment.prefix = deployment.prefix || (deployment.database + '-');
            break;
        case 'map':
            deployment.prefix = deployment.prefix || (deployment.database + '-');
            deployment.map = deployment.map || {};
            break;
        default:
            deployment.strategy = 'single';
    }

    return deployment;
};

ConnectionManager.processSSLConfig = function (options) {
    var certs, cwd = process.cwd();
    if (options.sslValidate === undefined) {
        options.sslValidate = true; // change default with respect to old driver version
    }
    else if (!options.sslValidate) {
        dbConnectionLogger.warn('Unsecure TLS configuration: sslValidate set to false');
    }

    if (options.sslCA) {
        certs = options.sslCA;
        if (certs) {
            if (typeof certs === 'string') {
                options.sslCA = [fs.readFileSync(path.resolve(cwd, certs))];

            }
            else {
                options.sslCA = [];
                certs.forEach(function (cert) {
                    options.sslCA.push(fs.readFileSync(path.resolve(cwd, cert)));
                });
            }
        }
    }
    if (options.sslCert) {
        options.sslCert = [fs.readFileSync(path.resolve(cwd, options.sslCert))];
    }
    if (options.sslKey) {
        options.sslKey = [fs.readFileSync(path.resolve(cwd, options.sslKey))];
    }
};

ConnectionManager.prototype.onConnectionError = function () {
};

function resetMongoose() {
    dbConnectionLogger.info('Reset Mongoose library');
    mongoose.constructor.call(mongoose);
}
