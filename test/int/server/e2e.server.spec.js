'use strict';

var should = require('norman-testing-tp').chai.should();
var expect = require('norman-testing-tp').chai.expect;
var app = require('../../app');
var path = require('path');

var normanAPI = require('../api/normanRestApi');
var api = new normanAPI();


var projectId;
var userEmail = 'e2e.server@sap.com', userPassword = 'Minisap!1';
describe('Test REST API for E2E Server\r\n', function () {

    before('Intialize API', function (done) {
        api.initialize(userEmail, userPassword).then(done);
    });
    describe('Create a model and create a model\r\n', function () {
        it('Check User Info - should have 200', function (done) {
            api.getUserInfo(200, function (err, res) {
                var resultBody = res.body;
                expect(resultBody.email).equal(userEmail);
                done();
            });
        });

        it('Create a project - should have 201', function (done) {
            api.createProject(201, 'foo', function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    projectId = res.body._id;
                    projectId.should.be.not.empty;
                    done();
                }
            });
        });
        it('Create a model by import - should 201', function (done) {
            api.createModelByExcelImport(201, projectId, path.join(__dirname, 'material/fileExcel.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    res.body.entities.should.be.instanceof(Array);
                    done();
                }
            });
        });
        it('Get Model and do some check', function (done) {
            api.getModel(200, projectId, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    console.log(result);
                    expect(result.entities[0].name).equal('SalesOrder');
                    done();
                }
            });
        });
    });
});