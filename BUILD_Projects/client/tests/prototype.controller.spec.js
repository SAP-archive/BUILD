'use strict';

var expect = chai.expect;

describe('PrototypeCtrl', function () {
    var scope;
    var mocknpPrototype;
    var errorSpy, httpErrorSpy;
    var uiErrorMock, httpErrorMock;
    var httpBackend;
    var stateMock;
    var mockedAuthFactory;
    var mockedProjectFactory;
    var stateSpy;
    var currentProjectId = 'Project1234';
    var jQueryMock = function (element) {
        element.offset = function () {
            return {
                top: 0,
                left: 0
            };
        };
        return element;

    };
    var mockedAsideFactoryService = {
        push: function () {
        },
        pop: function () {
        }
    };
    var activeUser = {_id: '123456', name: 'Tester'};

    mockedProjectFactory = {
        getTeam: function () {
            var deferred = $q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve(
                {
                    '_id': 'a1e7f85e83f288a30a02866b',
                    'reject_list': [],
                    'invite_list': [{'email': 'admin@admin.com'}],
                    'user_list': [
                        {
                            '_id': USER_ID,
                            'email': 'contact.build@sap.com',
                            'name': 'BUILD Team',
                            'role': 'owner',
                            'user_id': '553f99e4221941b13eddcfdf'
                        }
                    ]
                }
            );
            return deferred;
        }
    };

    beforeEach(module('ui.router'));
    beforeEach(module('ngResource'));
    beforeEach(module('common.utils'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('account.auth'));
    beforeEach(module('shell.aside'));
    beforeEach(module('project.prototype', function ($provide) {
        $provide.value('ActiveProjectService', {
            id: currentProjectId,
            name: currentProjectId
        });
    }));
    beforeEach(module(function ($provide) {
        $provide.value('jQuery', jQueryMock);
        $provide.value('uiThumbnailGenerator', {});
    }));

    beforeEach(inject(function ($injector, $rootScope, $state, $controller, $httpBackend, $q) {
        httpBackend = $httpBackend;

        // The $controller service is used to create instances of controllers
        var $controller = $injector.get('$controller');
        scope = $rootScope.$new();

        uiErrorMock = {
            create: function () {
            }
        };
        httpErrorMock = {
            create: function () {
            }
        };
        errorSpy = sinon.spy(uiErrorMock, 'create');
        httpErrorSpy = sinon.spy(httpErrorMock, 'create');

        stateMock = {
            params: {
                currentProject: currentProjectId
            },
            go: function () {

            }
        };
        stateSpy = sinon.spy(stateMock, 'go');

        mockedAuthFactory = {
            getCurrentUser: function () {
                var deferred = $q.defer();
                deferred.$promise = deferred.promise;
                deferred.resolve(
                    {
                        _id: 'XYZ',
                        email: 'contact.build@sap.com',
                        'provider': 'local',
                        acl_roles: ['standard', 'owner-8de1a2f5adceee1f09fa3cff']
                    }
                );
                return deferred;
            }
        };

        mocknpPrototype = {
            getPrototype: function () {
                var deferred = $q.defer();
                deferred.resolve(
                    {
                        pages: [{
                            name: 'Page One'
                        }]
                    }
                );
                return deferred.promise;
            },
            getPrototypeLockStatus: function () {
                var deferred = $q.defer();
                deferred.resolve(
                    {
                        success: true
                    }
                );
                return deferred.promise;
            }
        };

        httpBackend.expect('GET', '/api/users/me').respond(200, activeUser);

        $controller('PrototypeCtrl as prototype', {
            $scope: scope,
            $state: stateMock,
            Auth: mockedAuthFactory,
            uiError: uiErrorMock,
            AsideFactory: mockedAsideFactoryService,
            npPrototype: mocknpPrototype,
            ProjectFactory: mockedProjectFactory,
            httpError: httpErrorMock
        });
    }));

    afterEach(function () {
        httpBackend.flush()
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
        errorSpy.reset();
        httpErrorSpy.reset();
        stateSpy.reset();
    });

    it('should set current project and current user', function () {
        scope.$apply();
        expect(scope.prototype.currentProject).to.be.equal(currentProjectId);
        expect(scope.prototype.user._id).to.be.eq('XYZ');
        expect(scope.prototype.screens.length).to.be.equal(1);
        expect(scope.prototype.screens[0].name).to.be.equal('Page One');
    });

    it('should call stateprovider function go when open page map view is clicked', function () {
        scope.$apply();
        scope.prototype.openPageMapView();
        expect(stateSpy.called).to.be.equal(true);
        expect(stateSpy.calledWith('shell.page-map-view', {currentProject: currentProjectId})).to.be.equal(true);
    });
});
