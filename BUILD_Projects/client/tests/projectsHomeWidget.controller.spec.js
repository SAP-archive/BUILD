'use strict';

var expect = chai.expect;
var assert = chai.assert;

describe('Unit Test: ProjectsWidgetCtrl', function () {
    var scope;
    var httpBackend;
    var rootScope;
    var location;
    var mockedProjectFactory;
    var mockedAuthFactory;
    var mockedActiveProjectService;
    var mockedNavBarService;
    var mockedAsideFactoryService;
    var userId = 'ABC1234';
    var singleProject = {
        '_id': '12344321',
        'name': 'Test project One',
        'isOwner': true,
        'archived': false,
        'created_by': 'ABC1234',
        'user_list': [{'_id': 'ABC1234', 'role': 'owner'}],
        'invite_list': [],
        'reject_list': [],
        'picture': 'assets/images/user01.jpg',
        'created_at': '2014-12-08T23:28:51.859Z',
        'updated_at': '2014-12-08T23:28:51.859Z'
    };
    var archivedProject = {
        '_id': '12344322',
        'name': 'Test project Two',
        'isOwner': true,
        'archived': true,
        'created_by': 'ABC1234',
        'user_list': [{'_id': 'ABC1234', 'role': 'owner'}],
        'invite_list': [],
        'reject_list': [],
        'picture': 'assets/images/user01.jpg',
        'created_at': '2014-12-08T23:28:51.859Z',
        'updated_at': '2014-12-08T23:28:51.859Z'
    };
    var newProject = {
        '_id': '12344323',
        'name': 'Test project Three',
        'isOwner': true,
        'archived': true,
        'created_by': 'ABC1234',
        'user_list': [{'_id': 'ABC1234', 'role': 'owner'}],
        'invite_list': [],
        'reject_list': [],
        'picture': 'assets/images/user01.jpg',
        'created_at': '2014-12-08T23:28:51.859Z',
        'updated_at': '2014-12-08T23:28:51.859Z'
    };
    var projectsArray = [singleProject, archivedProject];

    var currentUserSpy;
    var currentPrefSpy;
    var currentUpdatePrefSpy;
    var projectFactoryQuerySpy;
    var projectFactorySaveSpy;

    beforeEach(module('ui.router'));
    beforeEach(module('account.auth'));
    beforeEach(module('common.utils'));
    beforeEach(module('project.projectsHomeWidget'));
    beforeEach(module('ngResource'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('project.services'));

    beforeEach(inject(function ($injector, $rootScope, $state, $location, $httpBackend, $q) {

        httpBackend = $httpBackend;

        // The $controller service is used to create instances of controllers
        var $controller = $injector.get('$controller');

        scope = $rootScope.$new();
        $rootScope.currentProject = {}; // currentProject is a string id
        rootScope = $rootScope;
        location = $location;

        mockedProjectFactory = {
            query: function () {
                var deferred = $q.defer();
                deferred.$promise = deferred.promise;
                deferred.resolve(
                    projectsArray
                );
                return deferred;
            },
            save: function () {
                var deferred = $q.defer();
                deferred.$promise = deferred.promise;
                deferred.resolve(
                    newProject
                );
                return deferred;
            }
        };

        mockedAuthFactory = {
            getCurrentUser: function () {
                var deferred = $q.defer();
                deferred.$promise = deferred.promise;
                deferred.resolve(
                    {
                        _id: userId,
                        email: 'contact.build@sap.com',
                        'provider': 'local',
                        acl_roles: ['standard', 'owner-8de1a2f5adceee1f09fa3cff']
                    }
                );
                return deferred;
            },
            getPreferences: function () {
                var deferred = $q.defer();
                deferred.$promise = deferred.promise;
                deferred.resolve(
                    {
                      "_id":userId,
                      "preferences":{
                        "projectsHelp":
                          {
                          "disable":false
                        },
                        "help":
                          {
                          "disable":false
                        }
                      }
                    }

                );
                return deferred.$promise;
            },
            updatePreferences: function () {
                var deferred = $q.defer();
                deferred.$promise = deferred.promise;
                deferred.resolve(
                    {
                        "_id":userId,
                        "preferences":{
                            "projectsHelp":
                            {
                                "disable":false
                            },
                            "help":
                            {
                                "disable":false
                            }
                        }
                    }

                );
                return deferred.$promise;
            }
        };
        currentUserSpy = sinon.spy(mockedAuthFactory, 'getCurrentUser');
        currentPrefSpy = sinon.spy(mockedAuthFactory, 'getPreferences');
        currentUpdatePrefSpy = sinon.spy(mockedAuthFactory, 'updatePreferences');
        projectFactoryQuerySpy = sinon.spy(mockedProjectFactory, 'query');
        projectFactorySaveSpy = sinon.spy(mockedProjectFactory, 'save');

        mockedActiveProjectService = {id: null, name: null};
        mockedNavBarService = {
            updateHeading: function () {
            }
        };
        mockedAsideFactoryService = {
            push: function () {
            },
            pop: function () {
            },
            show: function () {
            }
        };

        var mockState = {
            params: {
                currentProject: ''
            },
            go: function (to, params, options) {

                this.params = params;
            }
        };
        $controller('ProjectsWidgetCtrl as projectsHomeWidget', {
            $state: mockState,
            $location: location,
            $scope: scope,
            Auth: mockedAuthFactory,
            ProjectFactory: mockedProjectFactory,
            ActiveProjectService: mockedActiveProjectService,
            AsideFactory: mockedAsideFactoryService,
            NavBarService: mockedNavBarService,
            uiError: $injector.get('uiError'),
            httpError: $injector.get('httpError')
        });

    }));

    it('Testing the ProjectsWidgetCtrl: default options', function () {
        scope.projectsHomeWidget.init();
        scope.$apply();

        expect(rootScope.currentProject).to.eql({});
        expect(scope.projectsHomeWidget.loading).to.eql(false);
        expect(scope.projectsHomeWidget.user._id).to.be.eq(userId);
        expect(currentUserSpy.called).to.eql(true);
        expect(currentPrefSpy.called).to.eql(true);

        assert(Array.isArray(scope.projectsHomeWidget.activeProjects), 'Should be empty when loaded first');
        expect(scope.projectsHomeWidget.activeProjects.length).to.equal(1);
        expect(scope.projectsHomeWidget.inviteProjects.length).to.equal(0);
        expect(scope.projectsHomeWidget.archivedProjects.length).to.equal(1);
        expect(scope.projectsHomeWidget.isCreatingNewProject).to.equal(false);
        expect(projectFactoryQuerySpy.called).to.eql(true);

    });

    it('Testing the ProjectsWidgetCtrl: validate create project functionality', function () {
        httpBackend.expect('POST', '/api/projects').respond(200, {
            '_id': '12344324',
            'name': 'Test project Four',
            'isOwner': true,
            'archived': false,
            'created_by': 'ABC1234',
            'user_list': [{'_id': 'ABC1234', 'role': 'owner'}],
            'invite_list': [],
            'reject_list': [],
            'picture': 'assets/images/user01.jpg',
            'created_at': '2014-12-08T23:28:51.859Z',
            'updated_at': '2014-12-08T23:28:51.859Z'
        });

        scope.projectsHomeWidget.init();
        scope.$apply();

        // These need to be called before tests pass
        expect(currentUserSpy.called).to.eql(true);
        expect(currentPrefSpy.called).to.eql(true);

        expect(scope.projectsHomeWidget.canCreate).to.eql(true);
        expect(projectFactoryQuerySpy.called).to.eql(true);
        expect(scope.projectsHomeWidget.loading).to.eql(false);
        expect(scope.projectsHomeWidget.user._id).to.be.eq(userId);
        expect(scope.projectsHomeWidget.activeProjects.length).to.equal(1);

        scope.projectsHomeWidget.createProject();

        expect(scope.projectsHomeWidget.activeProjects.length).to.equal(1);

        expect(scope.projectsHomeWidget.inviteProjects.length).to.equal(0);
        expect(scope.projectsHomeWidget.archivedProjects.length).to.equal(1);
        expect(scope.projectsHomeWidget.isCreatingNewProject).to.equal(false);
        
        expect(projectFactorySaveSpy.called).to.eql(true);
    });

    it('Testing the ProjectsWidgetCtrl: validate open project functionality', function () {
        scope.projectsHomeWidget.init();
        scope.$apply();

        expect(rootScope.currentProject).to.eql({});
        scope.projectsHomeWidget.openProject(2, 'Test');
        expect(rootScope.currentProject).to.equal(2);
        expect(scope.projectsHomeWidget.isCreatingNewProject).to.equal(false);

        // Validate Show project functionality
        expect(scope.projectsHomeWidget.isCreatingNewProject).to.equal(false);
        scope.projectsHomeWidget.showNewProjectForm();
        expect(scope.projectsHomeWidget.isCreatingNewProject).to.equal(true);
    });

});
