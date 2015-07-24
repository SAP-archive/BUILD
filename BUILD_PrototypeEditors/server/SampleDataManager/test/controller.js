'use strict';

var NormanTestRequester = require('norman-testing-server').Requester;
var path = require('path');
var NormanTestServer = require('norman-testing-server').server;
var Promise = require('norman-promise');

var appServerStarted = null;
var normanTestRequester = null;

function initialize(user, password) {
    var deferred = Promise.defer();
    NormanTestServer.initialize(path.resolve(__dirname, '../../test/config.json')).then(function(server) {
            normanTestRequester = new NormanTestRequester(server.app, user, password, deferred.resolve);
        })
        .catch(function(err) {
            console.log(err);
        });
    return deferred.promise;
}

module.exports = {
    getServerPromise: function() {
        if (!appServerStarted) {
            appServerStarted = initialize('entity.datamodeler@test.com', 'Minitest!1');
        }
        return appServerStarted;
    }
};
