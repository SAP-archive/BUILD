'use strict';

var NormanTestServer = require('norman-testing-server').server;
var NormanTestRequester = require('norman-testing-server').Requester;
var promise = require('norman-promise');
var path = require('path');
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var configJson = require('../../config.json');


function BusinessCatalogRestApi() {
}

BusinessCatalogRestApi.prototype.dbInitialize = function (callback) {
    var server;
    NormanTestServer.initialize(configJson)
        .then(function (result) {
            server = result;
            return NormanTestServer.dropDB();
        })
        .then(function () {
            return server.initSchema();
        })
        .callback(callback);
};

BusinessCatalogRestApi.prototype.initializeAdmin = function (user, password) {
    var self = this;

    return new Promise(function (resolve, reject) {
        NormanTestServer.initialize(configJson)
            .then(function (server) {
                var aclService = registry.getModule('AclService');
                var systemContext = {
                    ip: '::1',
                    user: {
                        _id: '0',
                        name: 'SYSTEM'
                    }
                };

                self.normanTestRequester = new NormanTestRequester(server.app, user, password, function () {
                    var userService = registry.getModule('UserService');
                    var admin = {name: user, password: password, email: user};

                    userService.createLocalAdmin(admin, systemContext)
                        .then(function () {
                            aclService.getAcl().allowEx(configJson.security.roles.globalRoles, systemContext, resolve);
                        })
                        .catch(reject);

                });

            });
    });
};

BusinessCatalogRestApi.prototype.initialize = function (user, password) {
    var deferred = promise.defer();
    var self = this;
    NormanTestServer.initialize(path.join(__dirname, '../../config.json')).then(function (server) {
        self.normanTestRequester = new NormanTestRequester(server.app, user, password, deferred.resolve);
    });
    return deferred.promise;
};

/*     =========== catalogs =========================== */
BusinessCatalogRestApi.prototype.getCatalogs = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/catalogs/', httpCodeExpected, fnCallBack);
};

BusinessCatalogRestApi.prototype.getCatalog = function (httpCodeExpected, catalogId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/catalogs/' + catalogId, httpCodeExpected, fnCallBack);
};

BusinessCatalogRestApi.prototype.createCatalog = function (httpCodeExpected, catalog, fnCallBack) {
    this.normanTestRequester.reqPost('/api/catalogs/', httpCodeExpected, fnCallBack, catalog);
};

BusinessCatalogRestApi.prototype.updateCatalog = function (httpCodeExpected, catalogId, catalog, fnCallBack) {
    this.normanTestRequester.reqPut('/api/catalogs/' + catalogId, httpCodeExpected, fnCallBack, catalog);
};

BusinessCatalogRestApi.prototype.deleteCatalog = function (httpCodeExpected, catalogId, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/catalogs/' + catalogId, httpCodeExpected, fnCallBack);
};

BusinessCatalogRestApi.prototype.getEntity = function (httpCodeExpected, entityId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/catalogs/entities/' + entityId, httpCodeExpected, fnCallBack);
};

/*     =========== Business services of Business Catalog =========================== */

BusinessCatalogRestApi.prototype.import = function (httpCodeExpected, context, fnCallBack) {
    this.normanTestRequester.reqPost('/api/catalogs/import', httpCodeExpected, fnCallBack, context);
};

BusinessCatalogRestApi.prototype.entitySearch = function (httpCodeExpected, search, fnCallBack) {
    this.normanTestRequester.reqPost('/api/catalogs/entities/search', httpCodeExpected, fnCallBack, search);
};


module.exports = BusinessCatalogRestApi;
