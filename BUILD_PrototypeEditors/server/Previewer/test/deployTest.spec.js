'use strict';


var expect = require('chai').expect;
var commonServer = require('norman-common-server');
var logger = commonServer.logging.createLogger('test.previewer-server.deploy');
var tp = commonServer.tp;
var stream = tp.streamifier;
var path = require('path');
var fs = require('fs');

var skipTests = false;

var appDir = path.dirname(require.main.filename);
var _mockProjectId = '0397820d2eccf02f0999a074';
var basicFolder = path.join(appDir, './../../../');
// mock data for prototype latest version
var _mockGetPrototypeResult = {
    version: '1',
    isSnapshot: true,
    isHistory: false,
    stats: {
        created_at:  new Date(),
        created_by: 'Beata'
    },
    snapshot: {
        version: '2',
        snapshotDesc: 'test desc'
    }
};
var pathLoc = basicFolder + _mockProjectId + '/' + _mockGetPrototypeResult.snapshot.version;

describe('DeployService', function () {

    //before hooks
    beforeEach(function (done) {
        this.timeout(30000);


        done();
    });

    //after hooks
    afterEach(function (done) {
        done();
    });


    it('should create artifacts and return the snapshot url', function (done) {
        var DeployService = require('../lib/services/deploy');
        var deployService = new DeployService();

        if (skipTests) {
            logger.info('skipping [deploy snapshot]');
            return done();
        }
        logger.info('beginning to test [deploy snapshot]');

        //mock data artifacts
        var mockFileContent = 'Hello';
        var readstream = stream.createReadStream(mockFileContent);
        readstream.pause();
        var mockGetArtifactsResult = [
            {
                filename: 'index-prod.html',
                fullpath : 'index-prod.html',
                content: readstream
            },
            {
                filename: 'dummy.view.xml',
                fullpath : 'view/dummy.view.xml',
                content: readstream
            },
            {
                filename: 'dummy2.view.xml',
                fullpath : 'view/dummy2.view.xml',
                content: readstream
            },
            {
                filename: 'controller.js',
                fullpath : 'controllers/controller.js',
                content: readstream
            }
        ];

        logger.info('stubbing services for mocking return values [deploy snapshot]');

        logger.info('test deploySnapshot service [deploy snapshot]');

        function verify(result){
            logger.info('validation started [deploy snapshot]');

            var itemNum = 0;
            mockGetArtifactsResult.forEach(function(artifact){
                var filepath = pathLoc + path.sep + artifact.fullpath;
                logger.info('check for created artifact:' + filepath + ' [deploy snapshot]');
                fs.exists(filepath, function(pathExists){
                    if (filepath.indexOf('index-prod.html') === -1) {
                        expect(pathExists).to.equal(true);
                    }

                    fs.readFile(filepath, 'utf8', function(/*content*/){
                        itemNum++;

                        if(itemNum === mockGetArtifactsResult.length){
                            logger.info('validate url returned by deploySnapshot [deploy snapshot]');
                            expect(result.url).to.equal('/deploy/public/' + _mockProjectId + '/latest/index.html');
                            logger.info('finishing to test [deploy snapshot]');
                            done();
                        }

                    });
                });

            });

        }

        deployService.deploySnapshot(_mockProjectId, _mockGetPrototypeResult.snapshot.version, mockGetArtifactsResult).then(function(result){
            // setTimeout: do verification only when all the promises are resolved
            setTimeout(function() {verify(result);}, 0);
        });

    });


    it('should retrieve buffer archive as stream for specific snapshot version', function (done) {
        var DeployService = require('../lib/services/deploy');
        var deployService = new DeployService();

        function verify(result){
            expect(result).to.not.equal(undefined);
            logger.info('finishing to test [retrieve snapshot zip as stream]');
            done();
        }

        deployService.retrieveZippedSnapshotContent(_mockProjectId,  _mockGetPrototypeResult.snapshot.version, true).then(function(result){
            // setTimeout: do verification only when all the promises are resolved
            setTimeout(function() {verify(result);}, 0);
        });


    });

    it('should retrieve buffer archive as zip for specific snapshot version', function (done) {
        if (skipTests) {
            logger.info('skipping [retrieve snapshot zip]');
            return done();
        }
        logger.info('beginning to test [retrieve snapshot zip]');

        var DeployService = require('../lib/services/deploy');
        var deployService = new DeployService();

        function verify(result){
            expect(result).to.not.equal(undefined);
            logger.info('finishing to test [retrieve snapshot zip]');
            done();
        }

        deployService.retrieveZippedSnapshotContent(_mockProjectId,  _mockGetPrototypeResult.snapshot.version).then(function(result){
            // setTimeout: do verification only when all the promises are resolved
            setTimeout(function() {verify(result);}, 0);
        });
    });

	// not always working, todo increase reliability
    it('should create artifacts with SharedFolder Path present and return the snapshot url', function (done) {
        var appDir = path.dirname(require.main.filename);
        process.env.SHARED_FOLDER = path.join( appDir + './../../../');

        //need to delete cache so taht it reload the require of deployment.js
        delete require.cache[require.resolve('../lib/services/deploy')];
        delete require.cache[require.resolve('../config/deployment.js')];

        var DeployService = require('../lib/services/deploy');
        var deployService = new DeployService();

        //mock data artifacts
        var mockFileContent = 'Hello';
        var readstream = stream.createReadStream(mockFileContent);
        readstream.pause();
        var mockGetArtifactsResult = [
            {
                filename: 'index-prod.html',
                fullpath : 'index-prod.html',
                content: readstream
            },
            {
                filename: 'dummy.view.xml',
                fullpath : 'view/dummy.view.xml',
                content: readstream
            },
            {
                filename: 'dummy2.view.xml',
                fullpath : 'view/dummy2.view.xml',
                content: readstream
            },
            {
                filename: 'controller.js',
                fullpath : 'controllers/controller.js',
                content: readstream
            }
        ];


        function verify(result){
            var itemNum = 0;
            mockGetArtifactsResult.forEach(function(artifact){
                var filepath = pathLoc + path.sep + artifact.fullpath;
                logger.info('check for created artifact:' + filepath + ' [deploy snapshot]');
                fs.exists(filepath, function(pathExists){
                    if (filepath.indexOf('index-prod.html') === -1) {
                        expect(pathExists).to.equal(true);
                    }

                    fs.readFile(filepath, 'utf8', function(/*content*/){
                        itemNum++;

                        if(itemNum === mockGetArtifactsResult.length){
                            logger.info('validate url returned by deploySnapshot [deploy snapshot]');
                            expect(result.url).to.equal('/deploy/public/' + _mockProjectId + '/latest/index.html');
                            logger.info('finishing to test [deploy snapshot]');
                            process.env.SHARED_FOLDER = '';
                            done();
                        }

                    });
                });

            });

        }

        deployService.deploySnapshot(_mockProjectId, _mockGetPrototypeResult.snapshot.version, mockGetArtifactsResult)
            .then(function(result){
                // setTimeout: do verification only when all the promises are resolved
                setTimeout(function() {verify(result);}, 0);
            });

    });

});
