'use strict';

var normanAppServer = require('../../app'); //need require app before normanTestRequester
var NormanTestServer = require('norman-testing-server').server;
var NormanTestRequester = require('norman-testing-server').Requester;
var Promise = require("norman-promise");


function normanRestApi() {
};

normanRestApi.prototype.initialize = function (user, password) {

    var deferred = Promise.defer();
    var self = this;
    NormanTestServer.initialize(normanAppServer).then(function (server) {
        self.normanTestRequester = new NormanTestRequester(server.app, user, password, deferred.resolve);
    });
    return deferred.promise;
};

//Create a user
normanRestApi.prototype.createUser = function (httpCodeExpected, user, password) {
    var userCreation = {name: user, email: user, password: password };
    this.normanTestRequester.reqPost('/api/users', httpCodeExpected, fnCallBack, userCreation);
};

//Get User Info
normanRestApi.prototype.getUserInfo = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/api/users/me', httpCodeExpected, fnCallBack);
};

/*     =========== Project =========================== */
normanRestApi.prototype.createProject = function (httpCodeExpected, projectName, fnCallBack) {
    var self = this;
    this.getUserInfo(200, function (err, res) {
        var resultBody = res.body;
        var userID = resultBody._id;
        var userEmail = resultBody.email;
        var projectCreation = {
            name: projectName,
            showForm: true,
            created_by: userID,
            user_list: [
                {user_id: userID, email: userEmail}
            ]
        };
        self.normanTestRequester.reqPost('/api/projects', httpCodeExpected, fnCallBack, projectCreation);
    });
};

/*     =========== Model =========================== */
normanRestApi.prototype.createModel = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqPost('/api/models', httpCodeExpected, fnCallBack);
};

normanRestApi.prototype.getModel = function (httpCodeExpected, projectID, fnCallBack) {
    this.normanTestRequester.reqGet('/api/models/' + projectID, httpCodeExpected, fnCallBack);
};

normanRestApi.prototype.updateModel = function (httpCodeExpected, projectID, fnCallBack) {
    this.normanTestRequester.reqPut('/api/models/' + projectID, httpCodeExpected, fnCallBack);
};

normanRestApi.prototype.deleteModel = function (httpCodeExpected, projectID, fnCallBack) {
    this.normanTestRequester.reqDelete('/api/models/' + projectID, httpCodeExpected, fnCallBack);
};

///*     =========== Import XL =========================== */
normanRestApi.prototype.createModelByExcelImport = function (httpCodeExpected, projectID, attachValue, fnCallBack) {
    this.normanTestRequester.contentType = 'multipart/form-data';
    this.normanTestRequester.reqPostAttach('/api/models/' + projectID + '/importxl', httpCodeExpected, fnCallBack, null, attachValue);
    this.normanTestRequester.contentType = null;
};

///*     =========== Navigation Property ===========================*/


module.exports = normanRestApi;