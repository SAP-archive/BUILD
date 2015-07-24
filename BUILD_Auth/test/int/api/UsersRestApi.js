'use strict';

var path = require('path');
var NormanTestServer = require('norman-testing-server').server;
var NormanTestRequester = require('norman-testing-server').Requester;
var Promise = require('norman-promise');
var commonServer = require('norman-common-server');
var mongoose;
var UserModel;

var USER_API_URL = '/api/users/';
var AUTH_API_URL = '/auth/';
var SIGNUP_URL = '/auth/signup';
var LOGIN_URL = '/auth/login';

var crypt = require('norman-auth-server/lib/services/user/user.crypto');

function UsersRestApi() {

}

UsersRestApi.prototype.initialize = function (username, password) {
    var self = this;
    if (NormanTestServer.appServer && NormanTestServer.appServer.status === 'stopped') {
        // workaround for NormanTestServer bug
        delete NormanTestServer.appServer;
    }
    var appServer;
    return NormanTestServer.initialize(path.resolve(__dirname, '../../bin/config-test.json'))
        .then(function (server) {
            appServer = server;
            return server.initSchema();
        })
        .then(function () {
            return appServer.checkSchema();
        })
        .then(function () {
            self.registry = commonServer.registry;
            self.userService = self.registry.getModule('UserService');
            self.User = self.userService.getModel();
            UserModel = self.userService.getModel();
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
        })
        .then(function () {
            if (username && password) {
                return self.authenticate(username, password);
            }
            else {
                return 200;
            }
        })
        .then(function (status) {
            if (username && password && (status !== 200)) {
                return new Promise(function (resolve, reject) {
                    var user = {
                        name: username,
                        email: username,
                        password: password
                    };
                    self.createUser(user, 201, function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            }
        });
};

UsersRestApi.prototype.authenticate = function (username, password, done) {
    var credential = {email: username, password: password }, testRequester = this.normanTestRequester;
    return new Promise(function (resolve, reject) {
        testRequester.req
            .post(LOGIN_URL)
            .set(testRequester.httpHeaders)
            .send(credential)
            .end(function (err, res) {
                if (err) {
                    console.log("Authentication failed", err);
                    reject(err);
                }
                else {
                    if (res.statusCode === 200) {
                        testRequester._token = res.body.token;
                        testRequester.setHeader('Authorization', 'Bearer ' + testRequester._token);
                        testRequester.setHeader('Cookie', testRequester._cookie + '; token=%22' + testRequester._token + '%22');
                    }
                    console.log("Authentication status " + res.statusCode);
                    resolve(res.statusCode);
                }
            });
    });
};

UsersRestApi.prototype.createUser = function (data, httpCodeExpected, fnCallBack) {
    var testRequester = this.normanTestRequester;
    var token;
    return new Promise(function (resolve, reject) {
        testRequester.req
            .post(SIGNUP_URL)
            .set(testRequester.httpHeaders)
            .send(data)
            .end(function (err, res) {
                 if (err) {
                    reject(err);
                }
                else {
                    if (res.statusCode === 201) {
                        token = res.body;
                        testRequester._token = token;
                        testRequester.setHeader('Authorization', 'Bearer ' + testRequester._token);
                        testRequester.setHeader('Cookie', testRequester._cookie + '; token=%22' + testRequester._token + '%22');
                    }
                    resolve(res.statusCode);
                }
            });
    })
        .then(function (statusCode) {
            if (httpCodeExpected && (statusCode !== httpCodeExpected)) {
                throw new Error('Expecting status ' + httpCodeExpected + ' and got status ' + statusCode);
            }
            return token;
        })
        .callback(fnCallBack);
};

UsersRestApi.prototype.me = function (httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet(USER_API_URL + 'me', httpCodeExpected, fnCallBack);
};

UsersRestApi.prototype.show = function (id, httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet(USER_API_URL + id, httpCodeExpected, fnCallBack);
};

UsersRestApi.prototype.updateProfile = function (id, data, httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqPut(USER_API_URL + id + '/profile', httpCodeExpected, fnCallBack, data);
};

UsersRestApi.prototype.changePassword = function (id, data, httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqPut(USER_API_URL + id + '/password', httpCodeExpected, fnCallBack, data);
};

UsersRestApi.prototype.changeAvatar = function (id, attachment, httpCodeExpected, fnCallBack) {
    this.normanTestRequester.contentType = 'multipart/form-data';
    this.normanTestRequester.reqPutAttach(USER_API_URL + id + '/avatar', httpCodeExpected, fnCallBack, {avatar: attachment});
    this.normanTestRequester.contentType = null;
};

UsersRestApi.prototype.requestPasswordChange = function (email, httpCodeExpected, fnCallBack, data) {
    this.normanTestRequester.reqGet(AUTH_API_URL + email + '/requestPwd', httpCodeExpected, fnCallBack, data);
};

UsersRestApi.prototype.resetPassword = function (token, data, httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqPut(AUTH_API_URL + token + '/resetPassword', httpCodeExpected, fnCallBack, data);
};

UsersRestApi.prototype.resendVerificationEmail = function (token, httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet(USER_API_URL + token + '/resendVerificationEmail', httpCodeExpected, fnCallBack);

};

UsersRestApi.prototype.verifyEmail = function (id, httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqGet(USER_API_URL + id + '/verifyEmail', httpCodeExpected, fnCallBack);
};

UsersRestApi.prototype.deleteUser = function (id, httpCodeExpected, fnCallBack) {
    this.normanTestRequester.reqDelete(USER_API_URL + id, httpCodeExpected, fnCallBack);
};


/* =================== Helper functions ==================== */
UsersRestApi.prototype.isContentTypeJSON = function (res) {
    return res.headers['content-type'].indexOf('application/json') ? false : true;
};

UsersRestApi.prototype.resetDB = function (done) {
    mongoose.db.dropDatabase(function () {
        done()
    });
};

UsersRestApi.prototype.findModel = function (findby) {
    var self = this;
    var deferred = Promise.defer();

    self.User.find(findby, function (err, doc) {
        if (err) deferred.reject(err);
        if (doc) deferred.resolve(doc);

    });
    return deferred.promise;
};

UsersRestApi.prototype.passwordCheck = function (user, password) {
    var isMatch = crypt.compare(password, user ? user.password : '', user ? user.salt : '');
    return isMatch;
};

module.exports = UsersRestApi;
