//(function () {
//    'use strict';
//    var expect = require('norman-testing-tp').chai.expect;
//    var sinon = require('sinon');
//    var Promise = require('norman-promise');
//    var publicArtifactsService,
//        callback,
//        expressStub;
//    var tp = require('norman-server-tp');
//    var routerMock = {
//        use: function () {
//        }
//    };
//
//    describe('SharedWorkspace.Artifact.API.Public/Snapshots Get API', function () {
//
//        this.timeout(15000);
//        before(function (done) {
//           // expressStub = sinon.stub(tp.express, 'Router').returns(routerMock);
//            publicArtifactsService = require('../../lib/api/public/index');
//            done();
//        });
//
//        after(function (done) {
//            expressStub.restore();
//            done();
//        });
//
//        it('SharedWorkspace.api.public.get()', function (done) {
//            //let the test begin
//            Promise.resolve(publicArtifactsService.use('/public/*', callback))
//                .then(function () {
//
//                    done();
//                });
//        });
//
//
//    });
//})();
