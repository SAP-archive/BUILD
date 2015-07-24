'use strict';

var path = require('path');
var util = require('util');
var request = require('supertest');
var commonServer = require('norman-common-server');

var logger = commonServer.logging.createLogger('test.requester');
commonServer.logging.manager.on('configure', function () {
    logger = commonServer.logging.createLogger('test.requester');
});

var defaultContentType = 'application/json;charset=UTF-8';
var SIGNUP_URL = '/auth/signup';
var LOGIN_URL = '/auth/login';

function Requester(app, user, password, fnCallback, forceCreateUser) {
    logger.info('Initializing Norman requester');
    if (typeof user === 'function') {
        fnCallback = user;
        user = undefined;
        password = undefined;
    }
    if (!app) {
        var err = new TypeError('App is mandatory');
        logger.error(err);
        if (typeof fnCallback !== 'function') {
            throw err;
        }
        fnCallback(err);
        return;
    }
    if (forceCreateUser === undefined) {
        forceCreateUser = true;
    }
    forceCreateUser = !!(forceCreateUser && user && password);
    if (forceCreateUser) {
        logger.info('Forcing creation of user ' + user);
    }
    this._headers = {};
    this._headerNames = {};
    this.header = {}; // legacy header handling
    this.setHeader('Content-Type', defaultContentType);
    this._token;
    this._xcsrf;

    this.req = request(app);
    var self = this;
    logger.info('1st request app \'' + LOGIN_URL + '\'');
    //Get http session Id
    if (user && password) {
        authenticationUser(self, user, password, forceCreateUser, fnCallback);
    }
    else {
        logger.info('No credential');
        fnCallback();
    }
}

module.exports = Requester;

Requester.prototype.loginUrl = LOGIN_URL;
Requester.prototype.signupUrl = SIGNUP_URL;

//Setter and getter
Object.defineProperties(Requester.prototype, {
    token: {
        get: function () {
            return this._token;
        }
    },
    cookie: {
        get: function () {
            return this.getHeader('Cookie');
        }
    },
    xCSRFToken: {
        get: function () {
            return this.getHeader('X-CSRF-Token');
        }
    },
    contentType: {
        get: function () {
            return this.getHeader('Content-Type');
        },
        set: function (value) {
            this.setHeader('Content-Type', value || defaultContentType);
        }
    },
    httpHeaders: {
        get: function () {
            var k, n, key, keys, headers;
            this.processLegacyHeaders();
            headers = {};
            keys = Object.keys(this._headers);
            n = keys.length;
            for (k = 0; k < n; ++k) {
                key = keys[k];
                headers[this._headerNames[key]] = this._headers[key];
            }
            return headers;
        }
    }
});

/**
 * Sets a request header
 * @param name
 * @param value
 */
Requester.prototype.setHeader = function (name, value) {
    var key = name.toLowerCase();
    this._headers[key] = value;
    this._headerNames[key] = name;
    delete this.header[name];
};

/**
 * Retrieves the value of a request header
 * @param name
 * @returns {*}
 */
Requester.prototype.getHeader = function (name) {
    return (this._headers[name.toLowerCase()] || this.header[name]);
};

/**
 * Removes a request header
 * @param name
 */
Requester.prototype.removeHeader = function (name) {
    var key = name.toLowerCase();
    delete this._headers[key];
    delete this.header[name];
};

Requester.prototype.processLegacyHeaders = function () {
    var k, n, key, keys = Object.keys(this.header);
    n = keys.length;
    if (n > 0) {
        logger.warn('Deprecated NormanRequester header property should not be used, use setHeader, getHeader, removeHeader API instead');
    }
    for (k = 0; k < n; ++k) {
        key = keys[k];
        this.setHeader(key, this.header[key]);
        delete this.header[key];
    }
};

Requester.prototype.setCookie = function (res) {
    var setCookie = res.header['set-cookie'];
    var cookie = this.cookie || '';
    if (setCookie) {
        if (!Array.isArray(setCookie)) {
            setCookie = [setCookie];
        }
        setCookie.forEach(function (val) {
            if (cookie) {
                cookie += '; ';
            }
            cookie += val;
        });
        if (cookie) {
            this.setHeader('Cookie', cookie);
        }
    }
};

function authenticationUser(self, user, password, forceCreateUser, fnCallback) {
    logger.info('Authentication User');

    var credential = {email: user, password: password};

    self.req
        .post(LOGIN_URL)
        .set(self.header)
        .send(credential)
        .end(function (err, res) {
            logger.info('Set credential');

            if (err) {
                logger.error(err, 'Unable to connect user!');
                fnCallback(err);
            }
            else {
                var statusCode = res.statusCode;
                // Dev-note: auth module returns 404 if the user is not registered.
                if (statusCode === 404) {
                    if (forceCreateUser) {
                        createUser(self, user, password, fnCallback);
                    }
                    else {
                        fnCallback();
                    }
                }
                else if (statusCode === 200) {
                    self.setCookie(res);
                    setToken(self, res.text);
                    if (res.header['x-csrf-token']) {
                        setXCSRFToken(self, res.header['x-csrf-token']);
                    }
                    fnCallback();
                }
                else {
                    logger.info('Unexpected Status Code: ' + statusCode);
                    fnCallback();
                }
            }
        });
}

function createUser(self, user, password, fnCallback) {
    logger.info('Create User');
    var userCreation = {name: user, email: user, password: password};
    logger.info('POST ' + SIGNUP_URL);
    self.req
        .post(SIGNUP_URL)
        .set(self.header)
        .send(userCreation)
        .end(function (err, res) {
            if (err) {
                logger.info(userCreation, '>> User creation failed with value');
                logger.info(err);
                fnCallback();
            }
            else {
                var statusCode = res.statusCode;
                if (statusCode == 201) {
                    self.setCookie(res);
                    setToken(self, res.body);
                    if (res.header['x-csrf-token'] != undefined) {
                        setXCSRFToken(self, res.header['x-csrf-token']);
                    }
                    fnCallback();
                }
                else {
                    logger.info('Unexpected Status Code: ' + statusCode);
                    logger.info('Token not set');
                    fnCallback();
                }
            }
        });
}

function setToken(self, token) {
    logger.info('Set Token');

    self._token = token;
}

function setXCSRFToken(self, xcsrfToken) {
    logger.info('Set XCSRF Token');
    self._xcsrf = xcsrfToken;
    self.setHeader('X-CSRF-Token', self._xcsrf);
}

function attach(request, statusCode, fnCallBack, attachments) {
    if (typeof attachments === 'string') {
        return attach(request, statusCode, fnCallBack, {file: attachments});
    }
    if (Array.isArray(attachments)) {
        return attach(request, statusCode, fnCallBack, {file: attachments});
    }

    if (typeof attachments !== 'object') {
        return fnCallBack(new TypeError('Invalid attachments'));
    }

    var fields = Object.keys(attachments);
    fields.forEach(function (field) {
        var attachment = attachments[field];
        if (typeof attachment === 'string') {
            request.attach(field, attachment);
        }
        else if (Array.isArray(attachment)) {
            attachment.forEach(function (file) {
                request.attach(field, file);
            });
        }
        else {
            return fnCallBack(new TypeError('Invalid attachment ' + field));
        }
    });

    request.expect(statusCode)
        .end(fnCallBack);
}

//Request function
Requester.prototype.reqPost = function (url, statusCode, fnCallBack, sendValue) {
    this.req
        .post(url)
        .set(this.httpHeaders)
        .send(sendValue)
        .expect(statusCode)
        .end(fnCallBack);
};
Requester.prototype.reqPostAttach = function (url, statusCode, fnCallBack, attachments) {
    var request = this.req.post(url).set(this.httpHeaders);
    attach(request, statusCode, fnCallBack, attachments);
};
Requester.prototype.reqPut = function (url, statusCode, fnCallBack, sendValue) {
    this.req
        .put(url)
        .set(this.httpHeaders)
        .send(sendValue)
        .expect(statusCode)
        .end(fnCallBack);
};
Requester.prototype.reqPutAttach = function (url, statusCode, fnCallBack, attachments) {
    var request = this.req.put(url).set(this.httpHeaders);
    attach(request, statusCode, fnCallBack, attachments);
};
Requester.prototype.reqGet = function (url, statusCode, fnCallBack) {
    this.req
        .get(url)
        .set(this.httpHeaders)
        .expect(statusCode)
        .end(fnCallBack);
};
Requester.prototype.reqGetParsed = function (url, statusCode, fnCallBack, fnParser) {
    this.req
        .get(url)
        .set(this.httpHeaders)
        .expect(statusCode)
        .parse(fnParser)
        .end(fnCallBack);
 };
Requester.prototype.reqPatch = function (url, statusCode, fnCallBack, sendValue) {
    this.req
        .patch(url)
        .set(this.httpHeaders)
        .send(sendValue)
        .expect(statusCode)
        .end(fnCallBack);
};
Requester.prototype.reqDelete = function (url, statusCode, fnCallBack) {
    this.req
        .delete(url)
        .set(this.httpHeaders)
        .expect(statusCode)
        .end(fnCallBack);
};
