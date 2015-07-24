/**
 * Created by i055023 on 5/1/15.
 */
'use strict';

var chai = require("norman-testing-tp").chai;
var sinon = require("norman-testing-tp").sinon;
var Promise = require("norman-promise");
var commonServer = require("norman-common-server");
var NormanError = commonServer.NormanError;
var commonServerRegistry = commonServer.registry;
var mongoose = commonServer.db.mongoose;
var Logger = commonServer.logging;
var serviceLoggerMock = {
    error : function(error){

    },
    info: function(info){

    },
    debug: function(log){

    }
};
var loggerStub,registryService;
var Promise = require('norman-promise');
var expect = chai.expect;
var tp = commonServer.tp,
    _ = tp.lodash;


var serviceName = "Module";
var cSRegistryGetModule;
var swRegistryService;
describe('Registry Service', function () {
    before(function (done) {
        cSRegistryGetModule = sinon.stub(commonServerRegistry,'getModule').returns(serviceName);
        loggerStub = sinon.stub(Logger,'createLogger').returns(serviceLoggerMock);
        registryService = require("../../lib/services/registry");
        swRegistryService = new registryService();
       done();
    });

    after(function(done){
        loggerStub.restore();
        cSRegistryGetModule.restore();
        done();
    });

    it("Should throw an error if no name is passed", function (done) {
        var error = swRegistryService.registerModule("","pre");
        expect(error.message).to.equal("Missing Module Name");
        done();
    });

    it("Register pre Process Module to SharedWorkspace", function (done) {
        expect(swRegistryService.registerModule(serviceName,"pre")).to.be.true;
        done();
    });

    it("Register post Process Module to SharedWorkspace", function (done) {
        expect(swRegistryService.registerModule(serviceName,"post")).to.be.true;
        done();
    });

    it("Should get all Registered Module to SharedWorkspace for pre Processing", function (done) {
        expect(_.size(swRegistryService.getModules("pre"))).to.equal(1);
        done();
    });

    it("Should get all Registered Module to SharedWorkspace for post Processing", function (done) {
        expect(_.size(swRegistryService.getModules("post"))).to.equal(1);
        done();
    });

    it("Should get specific module registered for pre Processing", function (done) {
        expect(swRegistryService.getModule(serviceName,'pre')).to.equal(serviceName);
        done();
    });

    it("Should get specific module registered for post Processing", function (done) {
        expect(swRegistryService.getModule(serviceName,'post')).to.equal(serviceName);
        done();
    });

    it("Should throw an error if module not found", function (done) {
        var error = swRegistryService.getModule("Module1","pre");
        expect(error.message).to.equal("Module is not Registed");
        done();
    });

    it("Should unRegister Module registered for Processing", function (done) {
        expect(swRegistryService.unregisterModule(serviceName)).to.be.true;
        expect(_.size(swRegistryService.getModules("pre"))).to.equal(0);
        expect(_.size(swRegistryService.getModules("post"))).to.equal(0);
        done();
    });
});

