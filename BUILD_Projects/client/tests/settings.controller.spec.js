/*eslint no-unused-expressions: 0 */
'use strict';

var expect = chai.expect;

describe('Unit Test: SettingsCtrl', function () {
    var scope,
            httpBackend,
            uiError = {
                create: function () {
                }
            },
            httpError = {
                create: function () {
                }
            },
            ActiveProjectService = {id: '123456', name: 'Tester'},
            errorSpy = sinon.spy(uiError, 'create'),
            httpErrorSpy = sinon.spy(httpError, 'create');

    beforeEach(module('ui.router'));
    beforeEach(module('project.settings'));
    beforeEach(module('ngResource'));
    beforeEach(module('project.services'));
    beforeEach(module('account.auth'));
    beforeEach(module('shell.aside'));
    beforeEach(module('project.services'));
    beforeEach(module('common.ui.elements'));

    beforeEach(inject(function ($injector, $controller, $rootScope, $httpBackend) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;

        $controller('ProjectSettingsCtrl', {
            $scope: scope,
            ActiveProjectService: ActiveProjectService,
            ProjectFactory: $injector.get('ProjectFactory'),
            uiError: uiError,
            httpError: httpError
        });
    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingRequest();
        errorSpy.reset();
        httpErrorSpy.reset();
    });

    it('Should initialise', function () {
        ActiveProjectService.archived = true;
        httpBackend
                .expect('GET', '/api/projects/' + ActiveProjectService.id)
                .respond(200, ActiveProjectService);

        expect(scope.projectLoaded).to.eq(false);
        expect(scope.project.archived).to.eq(false);

        httpBackend.flush();
        expect(scope.projectLoaded).to.eq(true);
        expect(scope.project.archived).to.eq(true);
    });

    it('Should initialise when server error', function () {
        httpBackend
                .expect('GET', '/api/projects/' + ActiveProjectService.id)
                .respond(400, {data: {error: ''}});

        expect(scope.projectLoaded).to.eq(false);
        expect(scope.project.archived).to.eq(false);

        httpBackend.flush();
        expect(scope.projectLoaded).to.eq(false);
        errorSpy.should.have.been.called;
        httpErrorSpy.should.have.been.called;
    });

    it('Should get the archive action name', function () {
        scope.project.archived = false;
        expect(scope.archiveActionName()).to.eq('archive');

        scope.project.archived = true;
        expect(scope.archiveActionName()).to.eq('unarchive');
    });

    it('Should archive/unarchive a project', function () {
        httpBackend
                .expect('PUT', '/api/projects/' + ActiveProjectService.id + '/settings?archived=true')
                .respond(200, {});

        scope.enableArchiveButton = true;
        scope.project.archived = false;
        expect(scope.enableArchiveButton).to.eq(true);
        expect(scope.project.archived).to.eq(false);

        scope.archiveProject();
        expect(scope.enableArchiveButton).to.eq(false);
        expect(scope.project.archived).to.eq(true);

        scope.archiveProject();
        expect(scope.enableArchiveButton).to.eq(false);
        expect(scope.project.archived).to.eq(false);
    });

    it('Should catch errors when archiving/unarchiving a project', function () {
        httpBackend
                .expect('GET', '/api/projects/' + ActiveProjectService.id)
                .respond(200, ActiveProjectService);

        httpBackend
                .expect('PUT', '/api/projects/' + ActiveProjectService.id + '/settings?archived=true')
                .respond(400, {});

        scope.archiveProject();
        httpBackend.flush();

        errorSpy.should.have.been.called;
        httpErrorSpy.should.have.been.called;
    });
});
