'use strict';

var path = require('path');
var NormanTestServer = require('norman-testing-server').server;
var NormanTestRequester = require('norman-testing-server').Requester;
var promise = require('norman-promise');
var commonServer = require('norman-common-server');
var registry = require('norman-common-server').registry;
var mongoose;


var logger = commonServer.logging.createLogger("UIComposerRestApi");

function UIComposerRestApi() {
}

UIComposerRestApi.prototype.dbInitialize = function (callback) {
    NormanTestServer.initialize(path.join(__dirname, '../../config-uic.json')).then(function (server) {
        NormanTestServer.dropDB().then(function () {
//            var service = registry.getModule('UICatalog');
//                service.initializeDb(function (err) {
//                    if (err) {
//                        callback(err);
//                    }
                    server.initSchema().then(function(){
                            callback();
                    });
//            });
        });
    });
};

UIComposerRestApi.prototype.initialize = function (user, password) {
    var deferred = promise.defer(), self = this;

    // If remote API_URL provided run test against it (without local test server)
    if (process.env.API_URL) {
        self.normanTestRequester = new NormanTestRequester(process.env.API_URL, user, password, deferred.resolve);
    } else {
        NormanTestServer.initialize(path.join(__dirname, '../../config-uic.json')).then(function (server) {
            self.normanTestRequester = new NormanTestRequester(server.app, user, password, deferred.resolve);
        });
    }
    return deferred.promise;
};


UIComposerRestApi.prototype.getUi5libs = function (httpCodeExpected, resource, fnCallBack) {
    this.normanTestRequester.reqGet('/sapui5/' + resource, httpCodeExpected, fnCallBack);
};

UIComposerRestApi.prototype.getDeploy = function (httpCodeExpected, projectId, version, resource, fnCallBack) {
    this.normanTestRequester.reqGet('/deploy/public/' + projectId + '/' + version + '/' + resource, httpCodeExpected, fnCallBack);
};

UIComposerRestApi.prototype.createPrototype = function (httpCodeExpected, projectId, model, fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects/' + projectId + '/prototype', httpCodeExpected, fnCallBack, model);
};

UIComposerRestApi.prototype.getPrototype = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/prototype', httpCodeExpected, fnCallBack);
};

UIComposerRestApi.prototype.createPage = function (httpCodeExpected, projectId, model, fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects/' + projectId + '/prototype/page', httpCodeExpected, fnCallBack, model);
};

UIComposerRestApi.prototype.updatePage = function (httpCodeExpected, projectId, model, fnCallBack) {
    this.normanTestRequester.reqPut('/api/projects/' + projectId + '/prototype/page', httpCodeExpected, fnCallBack, model);
};

UIComposerRestApi.prototype.deletePage = function (httpCodeExpected, projectId, pageName, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/projects/' + projectId + '/prototype/page/?pageName=' + pageName, httpCodeExpected, fnCallBack);
};

UIComposerRestApi.prototype.getPage = function (httpCodeExpected, projectId, pageName, controlId, getName, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/prototype/page/?pageName=' + pageName +
        ( controlId ? '&controlId=' + controlId : '' ) +
        ( getName ? '&getName=' + getName : '') , httpCodeExpected, fnCallBack);
};

UIComposerRestApi.prototype.getArtifact = function (httpCodeExpected, projectId, artifactPath, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/prototype/artifact/' + artifactPath, httpCodeExpected, fnCallBack);
};

UIComposerRestApi.prototype.getSnapshot = function (httpCodeExpected, projectId, version, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/prototype/snapshot' + (version ? '?version=' + version : ''), httpCodeExpected, fnCallBack);
};

UIComposerRestApi.prototype.getZippedSnapshot = function (httpCodeExpected, projectId, version, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/prototype/zipsnapshot?version=' + version, httpCodeExpected, fnCallBack);
};

UIComposerRestApi.prototype.createSnapshot = function (httpCodeExpected, projectId, model, fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects/' + projectId + '/prototype/snapshot', httpCodeExpected, fnCallBack, model);
};

// Datamodeler api to test UIComposer services
UIComposerRestApi.prototype.importModel = function (httpCodeExpected, projectId, attachValue, fnCallBack) {
    this.normanTestRequester.contentType = 'multipart/form-data';
    this.normanTestRequester.reqPostAttach('/api/models/' + projectId + '/importxl', httpCodeExpected, fnCallBack, attachValue);
    this.normanTestRequester.contentType = null;
};

// SW api to lock
UIComposerRestApi.prototype.createPrototypeLock = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects/' + projectId + '/prototype/lock', httpCodeExpected, fnCallBack);
};
// App API's for setup and integration tests

UIComposerRestApi.prototype.getUserDetails = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/users/me', httpCodeExpected, fnCallBack);
};

UIComposerRestApi.prototype.isContentTypeJSON = function (res) {

    return res.headers['content-type'].indexOf('application/json') ? false : true;
};

UIComposerRestApi.prototype.isContentTypeXML = function (res) {

    return res.headers['content-type'].indexOf('application/xml') ? false : true;
};

UIComposerRestApi.prototype.isContentTypeStreamZIP = function (res) {

    return (res.headers['content-type'].indexOf('application/octet-stream') &&
            res.headers['content-disposition'].indexOf('.zip')) ? false : true;
};

UIComposerRestApi.prototype.isContentType = function (res, contentType) {
    return (res.headers['content-type'].indexOf(contentType)) ? false : true;
};

UIComposerRestApi.prototype.getProject = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId, httpCodeExpected, fnCallBack);
};

UIComposerRestApi.prototype.getProjects = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/', httpCodeExpected, fnCallBack);
};

UIComposerRestApi.prototype.updateProject = function (httpCodeExpected, projectId, model, fnCallBack) {
    this.normanTestRequester.reqPut('/api/projects/' + projectId, httpCodeExpected, fnCallBack, model);
};

UIComposerRestApi.prototype.deleteProject = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/projects/' + projectId, httpCodeExpected, fnCallBack);
};

UIComposerRestApi.prototype.createProject = function (httpCodeExpected, model, fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects', httpCodeExpected, fnCallBack, model);
};

UIComposerRestApi.prototype.deletePrototypeLock = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/projects/' + projectId + '/prototype/lock', httpCodeExpected, fnCallBack);
};


UIComposerRestApi.prototype.resetDB = function (done) {

    mongoose = commonServer.db.connection.getMongooseConnection({database: 'norman-ui-composer-server-test'});

    mongoose.db.dropDatabase(function () {
        done()
    });

};

UIComposerRestApi.prototype.shutdown = function (done) {

    mongoose.db.dropDatabase(function () {
        done()
    });

};


module.exports = UIComposerRestApi;
