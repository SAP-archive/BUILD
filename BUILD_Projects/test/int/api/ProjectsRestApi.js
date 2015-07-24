'use strict';

var path = require('path');
var NormanTestServer = require('norman-testing-server').server;
var NormanTestRequester = require('norman-testing-server').Requester;
var promise = require('norman-promise');
var commonServer = require('norman-common-server');
var mongoose;

require('../../test-app.js');

function ProjectsRestApi() {
}

ProjectsRestApi.prototype.initialize = function (user, password, hasInitSchemaCalled) {
    var deferred = promise.defer();
    var self = this;

    if (arguments.length === 2) {
        hasInitSchemaCalled = true;
    } else {
        hasInitSchemaCalled = false;
    }

    NormanTestServer.initialize(path.resolve(__dirname, '../../config-test.json'))
        .then(function (server) {

            if (!hasInitSchemaCalled) {
                NormanTestServer.appServer.initSchema();
                hasInitSchemaCalled = true;
            }

            self.registry = commonServer.registry;
            self.assetService = self.registry.getModule('AssetService');
            self.Asset = self.assetService.getModel();
            self.History = self.registry.getModule('HistoryService').getModel();
            // Create index to ensure test for uniqueness passes!!!
            self.History.ensureIndexes();
            self.Project = self.registry.getModule('ProjectService').getModel();

            mongoose = commonServer.db.connection.getMongooseConnection({database: 'norman-projects-server-test'});

            self.normanTestRequester = new NormanTestRequester(server.app, user, password, deferred.resolve);
        });
    return deferred.promise;
};

ProjectsRestApi.prototype.getUserDetails = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/users/me', httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.getProject = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId, httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.getArchivedProject = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/?showArchived=true', httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.getArchivedProjects = function (httpCodeExpected, isFlag, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/?showArchived=' + isFlag, httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.getProjects = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/', httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.changeOwner = function (httpCodeExpected, projectId, newOwner, fnCallBack) {
    this.normanTestRequester.reqPut('/api/projects/' + projectId + '/owner', httpCodeExpected, fnCallBack, newOwner);
};

ProjectsRestApi.prototype.updateProject = function (httpCodeExpected, projectId, model, fnCallBack) {
    this.normanTestRequester.reqPut('/api/projects/' + projectId + '/settings', httpCodeExpected, fnCallBack, model);
};

ProjectsRestApi.prototype.deleteProject = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/projects/' + projectId + '/settings', httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.createProject = function (httpCodeExpected, model, fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects', httpCodeExpected, fnCallBack, model);
};

ProjectsRestApi.prototype.getTeam = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/team', httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.createInvite = function (httpCodeExpected, projectId, model, fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects/' + projectId + '/invite', httpCodeExpected, fnCallBack, model);
};

ProjectsRestApi.prototype.acceptInvite = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqPut('/api/projects/' + projectId + '/invite', httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.rejectInvite = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/projects/' + projectId + '/invite', httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.createHistory = function (httpCodeExpected, projectId, model, fnCallBack) {
    this.normanTestRequester.reqPost('/api/projects/' + projectId + '/history', httpCodeExpected, fnCallBack, model);
};

ProjectsRestApi.prototype.getHistory = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/history', httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.getTeam = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/team', httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.uploadAsset = function (httpCodeExpected, projectId, attachValue, fnCallBack) {
    this.normanTestRequester.contentType = 'multipart/form-data';
    this.normanTestRequester.reqPostAttach('/api/projects/' + projectId + '/document', httpCodeExpected, fnCallBack, attachValue);
    this.normanTestRequester.contentType = null;
};

ProjectsRestApi.prototype.uploadAssetWithNoMultiPart = function (httpCodeExpected, projectId, attachValue, fnCallBack) {
    this.normanTestRequester.reqPostAttach('/api/projects/' + projectId + '/document', httpCodeExpected, fnCallBack, attachValue);
    this.normanTestRequester.contentType = null;
};

ProjectsRestApi.prototype.uploadLinkImage = function (httpCodeExpected, projectId, attachValue, fnCallBack) {
    this.normanTestRequester.contentType = 'multipart/form-data';
    this.normanTestRequester.reqPostAttach('/api/projects/' + projectId + '/document/?linkImage=true', httpCodeExpected, fnCallBack, attachValue);
    this.normanTestRequester.contentType = null;
};

ProjectsRestApi.prototype.getAsset = function (httpCodeExpected, projectId, assetId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/document/' + assetId + '/', httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.getAssetByVersion = function (httpCodeExpected, projectId, assetId, version, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/document/' + assetId + '/' + version + '/', httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.getAssetWithFilter = function (httpCodeExpected, projectId, assetId, filter, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/document/' + assetId + '/?' + filter, httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.getAssets = function (httpCodeExpected, projectId, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/document/', httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.filterAssets = function (httpCodeExpected, projectId, filter, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/document/?' + filter, httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.renderAsset = function (httpCodeExpected, projectId, assetId, filter, fnCallBack) {
    filter = (filter !== null) ? '?' + filter : '';
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/document/' + assetId + '/render/' + filter, httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.renderAssetByVersion = function (httpCodeExpected, projectId, assetId, version, fnCallBack) {
    this.normanTestRequester.reqGet('/api/projects/' + projectId + '/document/' + assetId + '/' + version + '/render', httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.deleteAsset = function (httpCodeExpected, projectId, assetId, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/projects/' + projectId + '/document/' + assetId + '/', httpCodeExpected, fnCallBack);
};

ProjectsRestApi.prototype.isContentTypeJSON = function (res) {

    return res.headers['content-type'].indexOf('application/json') ? false : true;
}

ProjectsRestApi.prototype.resetDB = function (done) {

    mongoose.db.dropDatabase(function () {
        done();
    });

};

ProjectsRestApi.prototype.shutdown = function (done) {

    mongoose.db.dropDatabase(function () {
        done();
    });

};

module.exports = ProjectsRestApi;
