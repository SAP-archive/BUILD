'use strict';

var chai = require('norman-testing-tp').chai;
var should = chai.should();
var expect = chai.expect;

var DataModelerAPI = require('../api/dataModelerRestApi');
var api = new DataModelerAPI();

var path = require('path');
var modelValue = require('./material/model.json');
var entities = require('./material/entities.json');
var properties = require('./material/properties.json');
var commonServer = require('norman-common-server');

describe('Test REST API for Model', function () {
    this.timeout(15000);
    before('Intialize API', function (done) {
        api.initialize('model.datamodeler@test.com','Minitest!1').then(done);
    });
    xdescribe('Create models and update it', function () {
        describe('Invalid Test Case\r\n', function () {
            var modelIDFail = {projectId: commonServer.utils.shardkey()};
            it('Call GET /api/models/:projectid - Get Model fail', function (done) {
                api.getModel(404, modelIDFail, function (err, res) {
                    if (err) return done(err);
                    done();
                });
            });
        });
        describe('Valid Test Case\r\n', function () {
                var modelID, model;
                it('Call POST /api/models - Add Model should 201 ', function (done) {
                    api.createModel(201, function (err, res) {
                        if (err) return done(err);
                        var result = res.body;
                        modelID = result.projectId;
                        modelID.should.not.be.empty;
                        done();
                    });
                });
                it('Call GET /api/models/:projectid - Get Model', function (done) {
                    api.getModel(200, modelID, function (err, res) {
                        if (err) return done(err);
                        model = res.body;
                        expect(model.projectId).equal(modelID);
                        done();
                    });
                });
                it('Call PUT /api/models/:projectid - Update Model with new name', function (done) {
                    model.version = 5;
                    api.updateModel2(204, modelID, model, function (err, res) {
                        if (err) return done(err);
                        done();
                    });
                });
        });
    });
});

