'use strict';

var path = require('path');
var NormanTestServer = require('norman-testing-server').server;
var NormanTestRequester = require('norman-testing-server').Requester;
var promise = require('norman-promise');
var commonServer = require('norman-common-server');
var mongoose;

function PassportRestApi(){

}

PassportRestApi.prototype.initialize = function(){
	var self = this;
    var appServer;
	return NormanTestServer.initialize(path.resolve(__dirname, '../../bin/config-test.json'))
        .then(function (server) {
            appServer = server;
            return server.initSchema();
        })
        .then(function () {
            return appServer.checkSchema();
        })
	    .then(function(){
			self.registry = commonServer.registry;
			self.Passport = self.registry.getModule('PassportService');
            return new Promise(function (resolve, reject) {
                self.normanTestRequester = new NormanTestRequester(appServer.app, undefined, undefined,
                    function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            mongoose = commonServer.db.connection.getMongooseConnection({database: 'norman-auth-server-test'});
                            resolve();
                        }
                    });
            });
		});
};

PassportRestApi.prototype.login = function (model,httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqPost('/auth/login', httpCodeExpected, fnCallBack, model);
};

PassportRestApi.prototype.local = function (model,httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqPost('/auth/login', httpCodeExpected, fnCallBack, model);
};

PassportRestApi.prototype.signup = function (model, httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqPost('/auth/signup', httpCodeExpected, fnCallBack, model);
};

PassportRestApi.prototype.features = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/auth/features', httpCodeExpected, fnCallBack);
};

PassportRestApi.prototype.logout = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/auth/logout', httpCodeExpected, fnCallBack);
};

PassportRestApi.prototype.facebook = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/auth/facebook', httpCodeExpected, fnCallBack);
};

PassportRestApi.prototype.policy = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet('/auth/policy', httpCodeExpected, fnCallBack);
};


/* =================== Helper functions ==================== */
PassportRestApi.prototype.isContentTypeJSON = function (res) {

	return res.headers['content-type'].indexOf('application/json') ? false : true;
};

PassportRestApi.prototype.resetDB = function (done) {


	mongoose.db.dropDatabase(function () {
		done();
	});

};

PassportRestApi.prototype.findModel = function(findby){
	var self = this;
	var deferred = promise.defer();

	self.User.find(findby, function(err, doc){
		if(err) deferred.reject(err);
		if(doc) deferred.resolve(doc);

	});
	return deferred.promise;
};

PassportRestApi.prototype.resetDB = function (done) {

    mongoose.db.dropDatabase(function () {
        done();
    });

};

PassportRestApi.prototype.shutdown = function (done) {

    mongoose.db.dropDatabase(function () {
        done();
    });

};

module.exports = PassportRestApi;
