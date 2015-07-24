'use strict';

var expect = chai.expect;

describe('Unit Test: TeamCtrl', function () {
    var scope;
    var httpBackend;
    var mockedActiveProjectService;
    var mockedHistoryService;
    var mockedUiError, mockedHttpError;
    var PROJECT_ID = '548634330dad778c2dcbd9fb';
    var errorSpy, httpErrorSpy;
    var historyObj = {project_id: PROJECT_ID, resource_version: 1, description: 'Test Desc'};

    beforeEach(module('ui.router'));
    beforeEach(module('project.history'));
    beforeEach(module('ngResource'));
    beforeEach(module('project.services'));
    beforeEach(module('project.services'));
    beforeEach(module('common.ui.elements'));

    beforeEach(inject(function ($injector, $rootScope, $httpBackend, $q, uiError, httpError) {
        httpBackend = $httpBackend;

        // The $controller service is used to create instances of controllers
        var $controller = $injector.get('$controller');

        scope = $rootScope.$new();

        mockedActiveProjectService = {id: PROJECT_ID, name: 'Test Project'};

        mockedUiError = uiError;
        mockedHttpError = httpError;
        errorSpy = sinon.spy(mockedUiError, 'create');
        httpErrorSpy = sinon.spy(mockedHttpError, 'create');

        mockedHistoryService = {
            getHistory: function () {
                var deferred = $q.defer();
                deferred.$promise = deferred.promise;
                deferred.resolve(
                    [historyObj]
                );
                return deferred;
            }
        };

        $controller('ProjectHistoryCtrl', {
            '$scope': scope,
            'HistoryService': mockedHistoryService,
            'ActiveProjectService': mockedActiveProjectService,
            'uiError': mockedUiError,
            'httpError': mockedHttpError
        });
    }));

    afterEach(function () {
        errorSpy.reset();
        httpErrorSpy.reset();
    });

    it('Nothing loaded, so events are empty', function () {
        // Before $apply is called the promise hasn't resolved the historyFactory yet
        expect(scope.events).to.be.undefined;
    });

    it('Ctrl is loaded, so events is loaded', function () {
        // Call $apply so events is populated
        scope.$apply();
        expect(scope.events.length).to.equal(1);
        expect(scope.events[0].project_id).to.equal(PROJECT_ID);
        expect(errorSpy.called).to.eql(false);
        expect(httpErrorSpy.called).to.eql(false);
    });

});
