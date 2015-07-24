'use strict';

var chai = require('norman-testing-tp').chai;
var should = chai.should();
var expect = chai.expect;

var api = require('../api/dataModelerRestApi');

xdescribe('Test REST API for Sample Data', function () {
    var modelID, entities = {};
    it('Prerequisite', function (done) {
        request(app)
            .post('/api/models')
            .expect(201)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var result = res.body;
                    modelID = result._id;
                    modelID.should.not.be.empty;
                    expect(result.projectId).equal(modelID);
                    expect(result.name).to.match(/^Model/);
                    request(app)
                        .post('/api/models/' + modelID + '/entities')
                        .send({name: 'A'})
                        .expect(201)
                        .expect('Content-Type', /json/)
                        .end(function (err, res) {
                            if (err) {
                                done(err);
                            } else {
                                var result = res.body;
                                var entityID = result._id;
                                entities[result.name] = result._id
                                entityID.should.not.be.empty;
                                request(app)
                                    .post('/api/models/' + modelID + '/entities/' + entityID + '/properties')
                                    .send({name: 'Name'})
                                    .expect(201)
                                    .expect('Content-Type', /json/)
                                    .end(function (err, res) {
                                        if (err) {
                                            done(err);
                                        } else {
                                            done();
                                        }
                                    });
                            }
                        });
                }
            });
    });
    it('add JSON sample Data', function (done) {
        var data = [{ID: '1', Name:'jlec1'}, {ID: '2', Name:'jlec2'}];
        request(app)
            .post('/api/models/'+ modelID + '/entities/'+ entities['A'] + '/sampleData')
            .send(data)
            .expect(201)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var result = res.body;
                    modelID = result._id;
                    modelID.should.not.be.empty;
                    expect(result.projectId).equal(modelID);
                    //modelName = result.name;
                    done();
                }
            });
    });
    it('update JSON sample Data', function (done) {
        var data = [{ID: '6', Name:'jlec6'}, {ID: '2', Name:'jlec2'}];
        request(app)
            .put('/api/models/'+ modelID + '/entities/'+ entities['A'] + '/sampleData')
            .send(data)
            .expect(201)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var result = res.body;
                    modelID = result._id;
                    modelID.should.not.be.empty;
                    expect(result.projectId).equal(modelID);
                    //modelName = result.name;
                    done();
                }
            });
    });

    it('add JSON sample Data', function (done) {
        var data = [{ID: '1', Name:'jlec1'}, {ID: '2', Name:'jlec2'}];
        request(app)
            .post('/api/models/'+ modelID + '/entities/'+ entities['A'] + '/sampleData')
            .send(data)
            .expect(201)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var result = res.body;
                    modelID = result._id;
                    modelID.should.not.be.empty;
                    expect(result.projectId).equal(modelID);
                    //modelName = result.name;
                    done();
                }
            });
    });
    it('delete JSON sample Data', function (done) {
        request(app)
            .delete('/api/models/'+ modelID + '/entities/'+ entities['A'] + '/sampleData')
            .expect(204)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });
    it('After clean data ', function (done) {
        request(app)
            .delete('/api/models/' + modelID)
            .expect(204)
            .end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });
});
