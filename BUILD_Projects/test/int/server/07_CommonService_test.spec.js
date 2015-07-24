'use strict';

var expect = require('norman-testing-tp').chai.expect;

var ProjectAPI = require('../api/ProjectsRestApi');
var api = new ProjectAPI();

describe('Common Project Service Test', function () {
    this.timeout(15000);
    var projectCommonService;

    before('Setup assetService', function (done) {
        var registry = require('norman-common-server').registry;
        projectCommonService = registry.getModule('ProjectCommonService');
        done();
    });

    after(function (done) {
        // Only required for one user to do this task!
        api.resetDB(done);
    });

    it('Call projectCommonService - should return correct values', function (done) {
        var isTrue = projectCommonService.isBoolean('true');
        expect(isTrue).to.eq(true);

        isTrue = projectCommonService.isBoolean('false');
        expect(isTrue).to.eq(isTrue);

        isTrue = projectCommonService.isBoolean('john');
        expect(isTrue).to.eq(false);

        done();
    });

    it('Call projectCommonService - valid mongo ID', function (done) {
        var isMongoId = projectCommonService.isMongoId('54e61f4ff38198e1514f0c69');
        expect(isMongoId).to.eq(true);

        isMongoId = projectCommonService.isMongoId('e61f4ff38198e1514f0c69');
        expect(isMongoId).to.eq(false);

        isMongoId = projectCommonService.isMongoId('27c5a8e95a99850609aa05ff');
        expect(isMongoId).to.eq(true);

        isMongoId = projectCommonService.isMongoId('54e7336034e2148ee601575a');
        expect(isMongoId).to.eq(true);

        done();
    });

    it('Call projectCommonService - validate email', function (done) {
        var isValid = projectCommonService.validateEmail('something@some.com');
        expect(isValid).to.eq(true);

        isValid = projectCommonService.validateEmail('some');
        expect(isValid).to.eq(false);

        done();
    });

});
