/**
 * Created by i055023 on 5/1/15.
 */
'use strict';

var chai = require('norman-testing-tp').chai;
var sinon = require('norman-testing-tp').sinon;
var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;
var testSinon = sinon.sandbox.create();
//  var Logger = commonServer.logging;
/*var serviceLoggerMock = {
 error : function(error){

 },
 info: function(info){

 },
 debug: function(log){

 }
 };*/
var appMetadataModel, AppMetadata, appMetadataService;
var expect = chai.expect;


var appMetadataMock = {
    ensureIndexes: function () {
    }
};

describe('AppMetadata Service', function () {

    var mongooseCreateStub = testSinon.stub(mongoose, 'createModel');
    mongooseCreateStub.withArgs('appMetadata').returns(appMetadataMock);


    before(function (done) {
        AppMetadata = require('../lib/services/appMetadata');
        appMetadataModel = require('../lib/services/appMetadata/model');
        appMetadataService = new AppMetadata();
        // loggerStub = sinon.stub(Logger, 'createLogger').returns(serviceLoggerMock);
        done();
    });

    after(function (done) {
        //loggerStub.restore();
        var mockDone = function () {

        };
        appMetadataService.shutdown(mockDone);
        testSinon.restore();
        done();
    });

    describe('appMetadata Model Check', function () {
        it('createModel', function (done) {
            var returnVal = appMetadataModel.create();
            expect(returnVal.appMetadata).to.be.equal(appMetadataMock);
            done();
        });
        it('createIndexes', function (done) {
            var func = sinon.spy();
            appMetadataModel.createIndexes(func);
            expect(func.called).to.be.true;
            func.reset();
            done();
        });
        it('destroy', function (done) {
            var func = sinon.spy();
            appMetadataModel.destroy(func);
            expect(func.called).to.be.true;
            func.reset();
            done();
        });
    });

    describe('appMetadata Functionality Check', function () {
        it('initialize', function (done) {
            var func = sinon.spy();
            appMetadataService.initialize(func);
            expect(func.called).to.be.true;
            done();
        });
        it('onInitialized', function (done) {
            var func = sinon.spy();
            appMetadataService.onInitialized(func);
            expect(func.called).to.be.true;
            done();
        });
        it('checkSchema', function (done) {
            var func = sinon.spy();
            appMetadataService.checkSchema(func);
            expect(func.called).to.be.true;
            done();
        });
        it('shutdown', function (done) {
            var func = sinon.spy();
            appMetadataService.shutdown(func);
            expect(func.called).to.be.true;
            done();
        });
        it('getAppMetadataModel', function (done) {
            var appMetadata = appMetadataService.getAppMetadaModel();
            expect(appMetadata).to.be.equal(appMetadataMock);
            done();
        });
    });


});

