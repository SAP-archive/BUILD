'use strict';
var fs = require('fs');
var path = require('path');
var NormanTestServer = require('norman-testing-server').server;
var NormanTestRequester = require('norman-testing-server').Requester;
var promise = require('norman-promise');
var commonServer = require('norman-common-server');
var registry = commonServer.registry;

var boundary = "0.8206060284283012";


function UICatalogRestApi() {
}

UICatalogRestApi.prototype.dbInitialize = function (callback) {
    NormanTestServer.initialize(path.join(__dirname, '../config.json')).then(function (server) {
        //NormanTestServer.dropDB().then(function () {
        var mongoose = commonServer.db.connection.getMongooseConnection({
            database: server.config.db.database
        });
        mongoose.db.dropCollection('uicatalogs', function() {
            //Should be in initSchema
//            var service = registry.getModule('UICatalog');
//            service.initializeDb(function (err) {
//                if (err) {
//                    callback(err);
//                }
//                callback();
//            });
            server.initSchema().then(function(){
                callback();
            });
        });
    });
};

UICatalogRestApi.prototype.initialize = function (user, password) {
    var deferred = promise.defer(), self = this;
    NormanTestServer.initialize(path.join(__dirname, '../config.json')).then(function (server) {
        self.normanTestRequester = new NormanTestRequester(server.app, user, password, deferred.resolve);
    });
    return deferred.promise;
};

UICatalogRestApi.prototype.initializeAdmin = function (user, password) {
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

UICatalogRestApi.prototype.getSampleTemplates = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/uicatalogs/getSampleTemplates', httpCodeExpected, fnCallBack);
};
UICatalogRestApi.prototype.getCatalogs = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/uicatalogs/getcatalogs/', httpCodeExpected, fnCallBack);
};
UICatalogRestApi.prototype.getUiCatalogsRoot = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/uicatalogs/getcatalogs/root', httpCodeExpected, fnCallBack);
};
UICatalogRestApi.prototype.getUiCatalogsCustom = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/uicatalogs/getcatalogs/custom', httpCodeExpected, fnCallBack);
};
UICatalogRestApi.prototype.getUiCatalogsDefault = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/uicatalogs/getcatalogs/default', httpCodeExpected, fnCallBack);
};
UICatalogRestApi.prototype.getCompatibleCatalogs = function (httpCodeExpected, catId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/uicatalogs/getCompatibleCatalogs/' + catId, httpCodeExpected, fnCallBack);
};
UICatalogRestApi.prototype.downloadcatalog = function (httpCodeExpected, fnCallBack) {

    this.normanTestRequester.reqGet('/api/uicatalogs/downloadcatalog/libtype/openui5', httpCodeExpected, fnCallBack);
};

UICatalogRestApi.prototype.getActions = function (httpCodeExpected, fnCallBack) {

    this.normanTestRequester.reqGet('/api/uicatalogs/catalog/name/openui5r4/catalogversion/1_0/actions', httpCodeExpected, fnCallBack);
};
UICatalogRestApi.prototype.getCatalog = function (httpCodeExpected,catName,catVersion, fnCallBack) {

    this.normanTestRequester.reqGet('/api/uicatalogs/catalog/name/'+catName+'/catalogversion/'+catVersion, httpCodeExpected, fnCallBack);
};
UICatalogRestApi.prototype.getPath = function (httpCodeExpected, fnCallBack) {

    this.normanTestRequester.reqGet('/api/uicatalogs/public/uilib/openui5/1.26.6/sap-ui-core.js', httpCodeExpected, fnCallBack);
};
UICatalogRestApi.prototype.getPathPrivate = function (httpCodeExpected, fnCallBack) {

    this.normanTestRequester.reqGet('/api/uicatalogs/private/uilib/openui5/1.26.6/sap-ui-core.js', httpCodeExpected, fnCallBack);
};
UICatalogRestApi.prototype.getAvailableVersions=function(httpCodeExpected,libType,fnCallBack){

    this.normanTestRequester.reqGet('/api/uicatalogs/libtype/'+libType+'/getuilibversions',httpCodeExpected,fnCallBack);
};

UICatalogRestApi.prototype.getCatalogById = function (httpCodeExpected, catId, fnCallBack) {

    this.normanTestRequester.reqGet('/api/uicatalogs/catalog/catalogid/' + catId, httpCodeExpected, fnCallBack);
};
UICatalogRestApi.prototype.getMetadataGeneratorFiles=function(httpCodeExpected,fnCallBack){

    this.normanTestRequester.reqGet('/api/uicatalogs/private/metadatagen/1.0/false/openui5/1.0/generateMetadataJson.js',httpCodeExpected,fnCallBack);
};

UICatalogRestApi.prototype.uploadUICatalog = function (httpCodeExpected, libType, libVersion, isPrivate, fnCallBack, attachValue) {
    this.normanTestRequester.contentType = 'multipart/form-data';
    this.normanTestRequester.reqPostAttach('/api/uicatalogs/uilib/' + libType + '/' + libVersion + '/' + isPrivate + '/uploaduilib', httpCodeExpected, fnCallBack, attachValue);
    this.normanTestRequester.contentType = null;
};
UICatalogRestApi.prototype.updateCustomCatalog = function (httpCodeExpected, fnCallBack, attachValue) {
    this.normanTestRequester.contentType = "application/json; charset=utf-8"
    this.normanTestRequester.reqPost('/api/uicatalogs/updateCustomCatalog', httpCodeExpected, fnCallBack, attachValue);
    this.normanTestRequester.contentType = null;
};

UICatalogRestApi.prototype.deleteCatalog = function (httpCodeExpected, fnCallBack) {

    this.normanTestRequester.reqDelete('/api/uicatalogs/catalog/name/openui5/catalogversion/1.26.6/delete', httpCodeExpected, fnCallBack);
};

UICatalogRestApi.prototype.downloadUI5Lib = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/uicatalogs/downloadcatalog/libtype/ui5', httpCodeExpected, fnCallBack);
};
UICatalogRestApi.prototype.uploadCatalog = function (httpCodeExpected, fnCallBack, attachValue) {
    this.normanTestRequester.contentType = 'multipart/form-data';
    this.normanTestRequester.reqPostAttach('/api/uicatalogs/catalogupload', httpCodeExpected, fnCallBack, attachValue);
    this.normanTestRequester.contentType = null;
};
UICatalogRestApi.prototype.uploadCatalogd = function (httpCodeExpected, fnCallBack, attachValue) {
    this.normanTestRequester.contentType = 'multipart/form-data';
    this.normanTestRequester.reqPostAttach('/api/uicatalogs/catalog/r1c1ui5/1_0/libraryupload', httpCodeExpected, fnCallBack, attachValue);
    this.normanTestRequester.contentType = null;
};

module.exports = UICatalogRestApi;