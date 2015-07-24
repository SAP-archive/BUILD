'use strict';

var chai = require('norman-testing-tp').chai;
var expect = chai.expect;

var xsrfFilter = require('../../lib/filters/xsrf');
var responseMock = require('./response.mock.js');
var requestMock = require('./request.mock.js');

var next = function () {
};

var filterFn = xsrfFilter.getFilter();

function test(httpMethod, headerToken, cookieToken, expectedStatus, acceptJson, done) {
    var req = new requestMock(acceptJson);
    req.headers = {};
    req.cookies = {};
    req.method = httpMethod;
    if (headerToken) {
        req.headers['x-csrf-token'] = headerToken;
    }
    if (cookieToken) {
        req.cookies['X-CSRF-Token'] = cookieToken;
    }
    var response = new responseMock();
    filterFn(req, response, next);
    expect(response.statusValue).to.be.eq(expectedStatus);
    done();
}

describe('Xsrf Filter Validation', function () {
    it('setToken', function (done) {
        var response = new responseMock();
        xsrfFilter.setToken(response);
        expect(response.xsrfHeader).to.be.eq(response.xsrfCookie);
        expect(response.xsrfCookieOptions.httpOnly).to.be.eq(false);
        done();
    });
    it('test xsrf filter, same token, PUT', function (done) {
        test('PUT', 'sameToken', 'sameToken', 200, true, done);
    });
    it('test xsrf filter, no xsrf OPTIONS', function (done) {
        test('OPTIONS', null, null, 200, true, done);
    });
    it('test xsrf filter, empty xsrf cookie Get Fetch', function (done) {
        test('GET', 'Fetch', null, 200, true, done);
    });
    it('test xsrf filter, empty xsrf cookie Get', function (done) {
        test('GET', null, null, 200, true, done);
    });
    it('test xsrf filter, empty xsrf header, PUT', function (done) {
        test('PUT', null, 'sameToken', 403, true, done);
    });
    it('test xsrf filter, empty xsrf cookie,PUT', function (done) {
        test('PUT', 'sameToken', null, 403, true, done);
    });
    it('test xsrf filter, not equal xsrf header and cookie, PUT', function (done) {
        test('PUT', 'aToken', 'bToken', 403, false, done);
    });
});
