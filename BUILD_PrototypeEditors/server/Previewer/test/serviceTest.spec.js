/**
 * Created by i055023 on 6/7/15.
 */
'use strict';
var expect = require('chai').expect;
var sinon = require('norman-testing-tp').sinon;
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var mongoose = commonServer.db.mongoose;
var testSinon = sinon.sandbox.create();

var mongooseMock = {
    ensureIndexes: function () {
    }
};

describe('Development Config Test',function(){
    it('check for Mongo connection Config without Node Env',function(done){
        var mongoConfigMock =  {
            uri: 'mongodb://localhost/norman-previewer',
            options: {
                db: {
                    safe: true
                }
            }
        };
        var devConfig = require('../config/environment/development.js');
        expect(devConfig.mongo.toString()).to.equal(mongoConfigMock.toString());
        done();
    });
});

describe('Service Check', function () {
    this.timeout(15000);
    var mainService;
    before(function (done) {
        testSinon.stub(registry, 'registerModule').returns();
        testSinon.stub(registry, 'getModule').returns({
            getUserId: function () {
            },
            checkAllowed: function () {
                return function (req, res, next) {
                    next();
                };
            }
        });
        testSinon.stub(mongoose, 'createModel').returns(mongooseMock);
        testSinon.stub(mongoose, 'model').returns(mongooseMock);
        mainService = require('../');
        done();
    });
    after(function (done) {

        testSinon.restore();
        done();
    });
    beforeEach(function (done) {
        done();
    });
    afterEach(function (done) {
        done();
    });

    it('Initialize', function (done) {
        var mockDone = function () {
            done();
        };
        mainService.initialize(mockDone);
    });
    it('onInitialized', function (done) {
        var mockDone = function () {
            done();
        };
        mainService.onInitialized(mockDone);
    });
    it('checkSchema', function (done) {
        var mockDone = function () {
            done();
        };
        mainService.checkSchema(mockDone);
    });
    it('shutdown', function (done) {
        var mockDone = function () {
            done();
        };
        mainService.shutdown(mockDone);
    });
    it('onSchemaChecked', function (done) {
        mainService.onSchemaChecked();
        done();
    });
    it('initializeSchema', function (done) {
        var mockDone = function () {
            done();
        };
        mainService.initializeSchema(mockDone);
    });
    it('onSchemaInitialized', function (done) {
        mainService.onSchemaInitialized();
        done();
    });
    it('prepareSchemaUpgrade', function (done) {
        var mockDone = function () {
            done();
        };
        mainService.prepareSchemaUpgrade(mockDone);
    });
    it('upgradeSchema', function (done) {
        var mockDone = function () {
            done();
        };
        mainService.upgradeSchema(mockDone);
    });
    it('onSchemaUpgraded', function (done) {
        mainService.onSchemaUpgraded();
        done();
    });
});
