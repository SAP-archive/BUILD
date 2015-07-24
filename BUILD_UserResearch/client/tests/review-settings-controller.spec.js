/*eslint no-unused-expressions: 0 */
'use strict';

var expect = chai.expect;

describe('Unit Test: UserResearch Review/SettingsCtrl', function () {
    var scope,
        httpBackend,
        uiError = {
            create: function () {}
        },
        stateParams = {
            studyId: 'studyId',
            currentProject: 'projectId'
        },
        currentStudy = {
            name: 'test',
            description: 'test study',
            status: 'published',
            _id: stateParams.studyId
        };

    beforeEach(module('ui.router'));
    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));
    beforeEach(module('ngResource'));
    beforeEach(module(function ($provide) {
        $provide.value('$stateParams', stateParams);
    }));

    beforeEach(inject(function ($injector, $controller, $rootScope, $httpBackend) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;

        $controller('ReviewSettingsCtrl', {
            $scope: scope,
            currentStudy: currentStudy,
            Studies: $injector.get('Studies'),
            uiError: uiError
        });
    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    /*** TESTS ************************************************************************************/
    it('should get the correct status of the study', function () {
        scope.init(currentStudy);
        expect(scope.isStudyPublished).to.be.true;
        expect(scope.isStudyPaused).to.be.false;
        expect(scope.isStudyArchived).to.be.false;
    });

    it('Should pause a study', function () {
        httpBackend
            .expect('PUT', '/api/projects/studies/studyId')
            .respond(200, {
                name: 'test',
                description: 'test study',
                status: 'paused',
                _id: '1'
            });

        scope.updateStatus('paused');
        httpBackend.flush();

        expect(scope.isStudyPublished).to.be.false;
        expect(scope.isStudyPaused).to.be.true;
        expect(scope.isStudyArchived).to.be.false;
    });

    it('Should archive a study', function () {
        httpBackend
            .expect('PUT', '/api/projects/studies/studyId')
            .respond(200, {
                name: 'test',
                description: 'test study',
                status: 'archived',
                _id: '1'
            });

        scope.updateStatus('paused');
        httpBackend.flush();

        expect(scope.isStudyPublished).to.be.false;
        expect(scope.isStudyPaused).to.be.false;
        expect(scope.isStudyArchived).to.be.true;
    });
});
