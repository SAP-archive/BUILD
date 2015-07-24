/**
 * Created by i055023 on 5/1/15.
 */
'use strict';

var chai = require('norman-testing-tp').chai;
var sinon = require('norman-testing-tp').sinon;
var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var Logger = commonServer.logging;
var testSinon = sinon.sandbox.create();
var serviceLoggerMock = {
    error: function () {

    },
    info: function () {

    },
    debug: function () {

    }
};
var commonModule, commonService;
var expect = chai.expect;
var jsonBody, resStatus;
var res = {
    status: function (status) {
        resStatus = status;
        return this;
    },
    json: function (json) {
        jsonBody = json;
        return this;
    }
};

describe('Common Service', function () {

    before(function (done) {
        testSinon.stub(Logger, 'createLogger').returns(serviceLoggerMock);
        commonModule = require('../lib/services/common');
        commonService = new commonModule();
        done();
    });

    after(function (done) {
        var mockDone = function () {

        };
        commonService.shutdown(mockDone);
        testSinon.restore();
        done();
    });

    describe('common Service Functionality Check', function () {
        it('initialize', function (done) {
            var func = sinon.spy();
            commonService.initialize(func);
            expect(func.called).to.be.true;
            done();
        });
        it('shutdown', function (done) {
            var func = sinon.spy();
            commonService.shutdown(func);
            expect(func.called).to.be.true;
            done();
        });
        it('onInitialized', function (done) {
            var func = sinon.spy();
            commonService.onInitialized(func);
            expect(func.called).to.be.true;
            done();
        });

        it('sendResponse', function (done) {
            commonService.sendResponse(res, '200', 'content');
            commonService.sendResponse(res, null, 'content');
            commonService.sendResponse(res, '200');
            commonService.sendResponse(res, null);
            done();
        });


        it('sendError with Error Stack', function (done) {
            var error = new NormanError('something Went Wrong');
            commonService.sendError(res, null, error);
            expect(jsonBody.error).to.be.equal('something Went Wrong');
            done();
        });

        it('sendError with Empty Status Code', function (done) {
            var err = {
                stack: null
            };
            commonService.sendError(res, null, err);
            expect(resStatus).to.be.equal(500);
            done();
        });
    });


});

