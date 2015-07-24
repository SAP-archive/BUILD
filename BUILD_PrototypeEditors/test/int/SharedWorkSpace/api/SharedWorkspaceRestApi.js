'use strict';

var path = require('path');
var NormanTestServer = require('norman-testing-server').server;
var NormanTestRequester = require('norman-testing-server').Requester;
var promise = require('norman-promise');
var commonServer = require('norman-common-server');
var mongoose;


var logger = commonServer.logging.createLogger("SharedWorkspaceRestApi");

function SharedWorkspaceRestApi() {
}

SharedWorkspaceRestApi.prototype.dbInitialize = function (callback) {
    NormanTestServer.initialize(path.join(__dirname, '../../config-sw.json')).then(function (server) {
            NormanTestServer.dropDB().then(function () {
//            var service = registry.getModule('UICatalog');
//               service.initializeDb(function (err) {
//                if (err) {
//                    callback(err);
//                }
//                callback();
//            });
                server.initSchema().then(function () {
                    return server.checkSchema();
                }).callback(callback);
            });
        }
    );
};

SharedWorkspaceRestApi.prototype.initialize = function (user, password) {
    var deferred = promise.defer(), self = this;

    // If remote API_URL provided run test against it (without local test server)
    if (process.env.API_URL) {
        self.normanTestRequester = new NormanTestRequester(process.env.API_URL, user, password, deferred.resolve);
    }
    else {
        NormanTestServer.initialize(path.join(__dirname, '../../config-sw.json')).then(function (server) {
            self.normanTestRequester = new NormanTestRequester(server.app, user, password, deferred.resolve);
        });
    }
    return deferred.promise;
};

SharedWorkspaceRestApi.prototype.createPrototypeLock = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects/' + projectId + '/prototype/lock', httpCodeExpected, fnCallBack);
};

SharedWorkspaceRestApi.prototype.getPrototypeLock = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/prototype/lock', httpCodeExpected, fnCallBack);
};

SharedWorkspaceRestApi.prototype.deletePrototypeLock = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/projects/' + projectId + '/prototype/lock', httpCodeExpected, fnCallBack);
};

// UIComposer API's.

SharedWorkspaceRestApi.prototype.createPrototype = function (httpCodeExpected, projectId, model, fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects/' + projectId + '/prototype', httpCodeExpected, fnCallBack, model);
};

SharedWorkspaceRestApi.prototype.getPrototype = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/prototype', httpCodeExpected, fnCallBack);
};

SharedWorkspaceRestApi.prototype.createPage = function (httpCodeExpected, projectId, model, fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects/' + projectId + '/prototype/page', httpCodeExpected, fnCallBack, model);
};

SharedWorkspaceRestApi.prototype.updatePage = function (httpCodeExpected, projectId, model, fnCallBack) {
    this.normanTestRequester.reqPut('/api/projects/' + projectId + '/prototype/page', httpCodeExpected, fnCallBack, model);
};

SharedWorkspaceRestApi.prototype.deletePage = function (httpCodeExpected, projectId, pageName, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/projects/' + projectId + '/prototype/page/?pageName=' + pageName, httpCodeExpected, fnCallBack);
};

SharedWorkspaceRestApi.prototype.getPage = function (httpCodeExpected, projectId, pageName, controlId, getName, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/prototype/page/?pageName=' + pageName +
    ( controlId ? '&controlId=' + controlId : '' ) +
    ( getName ? '&getName=' + getName : ''), httpCodeExpected, fnCallBack);
};

SharedWorkspaceRestApi.prototype.getArtifact = function (httpCodeExpected, projectId, artifactPath, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/prototype/artifact/' + artifactPath, httpCodeExpected, fnCallBack);
};

SharedWorkspaceRestApi.prototype.getSnapshot = function (httpCodeExpected, projectId, version, fnCallBack) {
    if (version) {
        this.normanTestRequester.reqGet('/api/projects/' + projectId + '/prototype/snapshot?version=' + version, httpCodeExpected, fnCallBack);
    }
    else {
        this.normanTestRequester.reqGet('/api/projects/' + projectId + '/prototype/snapshot', httpCodeExpected, fnCallBack);
    }
};

SharedWorkspaceRestApi.prototype.getZippedSnapshot = function (httpCodeExpected, projectId, version, fnCallBack) {

    function binaryParser(res, callback) {
        res.setEncoding('binary');
        res.data = '';
        res.on('data', function (chunk) {
            res.data += chunk;
        });
        res.on('end', function () {
            callback(null, new Buffer(res.data, 'binary'));
        });
    }

    if (version) {
        this.normanTestRequester.reqGetParsed('/api/projects/' + projectId + '/prototype/zipsnapshot?version=' + version, httpCodeExpected, fnCallBack, binaryParser);
    }
    else {
        this.normanTestRequester.reqGetParsed('/api/projects/' + projectId + '/prototype/zipsnapshot', httpCodeExpected, fnCallBack, binaryParser);
    }
};

SharedWorkspaceRestApi.prototype.getDeploy = function (httpCodeExpected, projectId, version, resource, fnCallBack) {
    this.normanTestRequester.reqGet('/deploy/public/' + projectId + '/' + version + '/' + resource, httpCodeExpected, fnCallBack);
};

SharedWorkspaceRestApi.prototype.getSnapshotArtifact = function (httpCodeExpected, projectId, version, resource, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/prototype/snapshot/' + version + '/' + resource, httpCodeExpected, fnCallBack);
};

SharedWorkspaceRestApi.prototype.createSnapshot = function (httpCodeExpected, projectId, model, fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects/' + projectId + '/prototype/snapshot', httpCodeExpected, fnCallBack, model);
};

// Datamodeler api to test UIComposer services
SharedWorkspaceRestApi.prototype.importModel = function (httpCodeExpected, projectId, attachValue, fnCallBack) {
    this.normanTestRequester.contentType = 'multipart/form-data';
    this.normanTestRequester.reqPostAttach('/api/models/' + projectId + '/importxl', httpCodeExpected, fnCallBack, attachValue);
    this.normanTestRequester.contentType = null;
};

// App API's for setup and integration tests

SharedWorkspaceRestApi.prototype.getUserDetails = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/users/me', httpCodeExpected, fnCallBack);
};

SharedWorkspaceRestApi.prototype.isContentTypeJSON = function (res) {

    return res.headers['content-type'].indexOf('application/json') ? false : true;
};

SharedWorkspaceRestApi.prototype.isContentTypeXML = function (res) {

    return res.headers['content-type'].indexOf('application/xml') ? false : true;
};

SharedWorkspaceRestApi.prototype.isContentTypeStreamZIP = function (res) {

    return (res.headers['content-type'].indexOf('application/octet-stream') &&
    res.headers['content-disposition'].indexOf('.zip')) ? false : true;
};

SharedWorkspaceRestApi.prototype.getProject = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId, httpCodeExpected, fnCallBack);
};

SharedWorkspaceRestApi.prototype.getProjects = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/', httpCodeExpected, fnCallBack);
};

SharedWorkspaceRestApi.prototype.updateProject = function (httpCodeExpected, projectId, model, fnCallBack) {
    this.normanTestRequester.reqPut('/api/projects/' + projectId, httpCodeExpected, fnCallBack, model);
};

SharedWorkspaceRestApi.prototype.deleteProject = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/projects/' + projectId, httpCodeExpected, fnCallBack);
};

SharedWorkspaceRestApi.prototype.createProject = function (httpCodeExpected, model, fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects', httpCodeExpected, fnCallBack, model);
};

SharedWorkspaceRestApi.prototype.createInvite = function (httpCodeExpected, projectId, model, fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects/' + projectId + '/invite', httpCodeExpected, fnCallBack, model);
};

SharedWorkspaceRestApi.prototype.acceptInvite = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqPut('/api/projects/' + projectId + '/invite', httpCodeExpected, fnCallBack);
};

SharedWorkspaceRestApi.prototype.resetDB = function (done) {

    mongoose = commonServer.db.connection.getMongooseConnection({database: 'norman-ui-composer-server-test'});

    mongoose.db.dropDatabase(function () {
        done()
    });

};

SharedWorkspaceRestApi.prototype.shutdown = function (done) {

    mongoose.db.dropDatabase(function () {
        done()
    });

};

module.exports = SharedWorkspaceRestApi;
