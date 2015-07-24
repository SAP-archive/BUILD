'use strict';
var path = require('path');
var server = require('../lib/server.js');
var expect = require('chai').expect;

function testPassed(done) {
    return function () {
        done();
    }
}
function testFailed(done) {
    return function (err) {
        done(err);
    }
}

describe('Smoke test for testing server', function () {
    this.timeout(15000);
    describe('Call function', function () {
        it('should start', function (done) {
            server.initialize(path.join(__dirname, 'bin/config.json'))
                .then(function () {
                    expect(server.appServer.status).to.equal('started');
                })
                .then(testPassed(done), testFailed(done));
        });
        it('getMongooseConnection should return an object', function (done) {
            var foo = server.getMongooseConnection();
            if (foo != null && foo != undefined) {
                done();
            }
            else {
                done('getMongooseConnection should return an object');
            }
        });
        it('dropDB', function (done) {
            var mongoose = server.getMongoose(),
                SchemaFoo = mongoose.Schema;

            var schemaFoo = new SchemaFoo({foo: 'string'});
            var Foo = mongoose.createModel('foo', schemaFoo);

            Foo.create({type:1} , function (err) {
                if (err){
                    testFailed(done);
                }
                server.dropDB()
                    .then(function () {
                        mongoose = server.getMongooseConnection();
                        expect(mongoose).to.not.be.undefined;
                        expect(mongoose).not.to.be.null;
                    })
                    .then(testPassed(done), testFailed(done));
            });
        });
    });
    after(function (done) {
        server.shutdown(true)
            .then(function () {
                expect(server.appServer.status).to.equal('stopped');
            })
            .then(testPassed(done), testFailed(done));
    });
});