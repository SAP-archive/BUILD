'use strict';

var appServer = require('node-sap-app-server');
var commonServer = require('norman-common-server');
var Promise = require('norman-promise');
var NormanTestingServer = {};
module.exports = NormanTestingServer;

NormanTestingServer.initialize = function (config, services) {
    var starting;
    if (this.appServer) {
        switch (this.appServer.status) {
            case "stopped":
                starting = this.startServer(config, services);
                break;
            case "starting":
                starting = this.appServer.starting;
                break;
            case "started":
                starting = Promise.resolve(this.appServer);
                break;
            case "stopping":
                throw new Error("Server is stopping");
        }
    }
    else {
        starting = this.startServer(config, services);
    }
    return starting;
};

NormanTestingServer.startServer = function (config, services) {
    var server = new appServer.Server(config, services);
    var starting = server.start();
    this.appServer = server.appServer;
    return starting;
};

NormanTestingServer.executeOnServices = function (fnName) {
    var errorMessage = 'Initialize testing server first.';
    if (this.appServer && this.appServer.serviceContainer) {
        errorMessage = 'Invalid function name.';
        if (typeof this.appServer.serviceContainer[fnName] === 'function') {
            return this.appServer.serviceContainer[fnName]();
        }
    }
    return Promise.reject(new Error(errorMessage));
};

NormanTestingServer.getMongooseConnection = function () {
    return commonServer.db.connection.getMongooseConnection();
};
NormanTestingServer.getMongoose = function () {
    return commonServer.db.mongoose;
};

NormanTestingServer.dropDB = function () {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.getMongooseConnection().db.dropDatabase(function (err){
            if (err){
                reject(err);
            }
            resolve(true);
        });
    });
};

NormanTestingServer.shutdown = function (forceExit) {
    if (this.appServer) {
        return this.appServer.shutdown(!forceExit);
    }
    else {
        return Promise.resolve(true);
    }
};