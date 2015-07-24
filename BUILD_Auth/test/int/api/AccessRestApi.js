'use strict';

var path = require('path');
var NormanTestServer = require('norman-testing-server').server;
var NormanTestRequester = require('norman-testing-server').Requester;
var promise = require('norman-promise');
var commonServer = require('norman-common-server');
var mongoose;

function AccessRestApi(){

}

AccessRestApi.prototype.initialize = function(){
    var deferred = promise.defer();

    var self = this;
    var appServer;
    NormanTestServer.initialize(path.resolve(__dirname, '../../bin/config-test.json'))//No initSchema there since we add role through the tests.
        .then(function (server) {
            appServer = server;
            return server.checkSchema();
        })
        .then(function (){
            self.registry = commonServer.registry;
            self.normanTestRequester = new NormanTestRequester(appServer.app, null, null, deferred.resolve);
            mongoose = commonServer.db.connection.getMongooseConnection({database: 'norman-auth-server-test'});
        });
    return deferred.promise;
};

AccessRestApi.prototype.hasAccess = function (user, httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqPost('/internal/hasAccess', httpCodeExpected, fnCallBack, user);
};

AccessRestApi.prototype.resetDB = function (done) {

    mongoose.db.dropDatabase(function () {
        done();
    });

};

AccessRestApi.prototype.shutdown = function (done) {

    mongoose.db.dropDatabase(function () {
        done();
    });

};

module.exports = AccessRestApi;
