'use strict';

var expect = chai.expect;
var assert = chai.assert;

describe('Unit Test: TeamCtrl', function () {
    var scope;
    var httpBackend;
    var location;
    var mockedAuthFactory;
    var mockedProjectFactory;
    var mockedActiveProjectService;
    var mockedAsideFactoryService = {
        pop: function () {
        }, push: function () {
        }
    };
    ;
    var mockedUiError = {}, mockedHttpError = {};
    var USER_ID = '548634330dad778c2dcbd9fb';
    var PROJECT_ID = 'ae676d3f2af4d1290a02813c';
    var broadcastSpy;
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

    beforeEach(module('ui.router'));
    beforeEach(module('ngResource'));
    beforeEach(module('project.team'));
    beforeEach(module('project.services'));

    beforeEach(inject(function ($injector, $rootScope, $state, $location, $httpBackend, $q) {
        httpBackend = $httpBackend;

        // The $controller service is used to create instances of controllers
        var $controller = $injector.get('$controller');

        scope = $rootScope.$new();
        $rootScope.currentProject = 'abcd1234'; // currentProject is just a string id
        location = $location;

        mockedAuthFactory = {
            getCurrentUser: function () {
                return {
                    _id: USER_ID,
                    email: 'contact.build@sap.com'
                };
            }
        };

        mockedProjectFactory = {
            query: function () {
                var deferred = $q.defer();
                deferred.$promise = deferred.promise;
                deferred.resolve(
                    [newProject]
                );
                return deferred;
            },
            createInvite: function () {
                var deferred = $q.defer();
                deferred.$promise = deferred.promise;
                deferred.resolve(
                    {
                        '_id': 'a1e7f85e83f288a30a02866b',
                        'name': 'Test1',
                        'reject_list': [],
                        'invite_list': [{'email': 'admin@admin.com'}],
                        'user_list': [
                            {
                                'user_id': USER_ID,
                                'email': 'contact.build@sap.com'
                            }
                        ],
                        'archived': true,
                        'deleted': false
                    }
                );
                return deferred;
            },
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

        mockedActiveProjectService = {id: PROJECT_ID, name: 'Test Project'};
        broadcastSpy = sinon.spy($rootScope, '$broadcast');

        $controller('TeamCtrl as team', {
            '$location': location,
            '$scope': scope,
            'Auth': mockedAuthFactory,
            'ProjectFactory': mockedProjectFactory,
            'AsideFactory': mockedAsideFactoryService,
            'ActiveProjectService': mockedActiveProjectService,
            'uiError': mockedUiError,
            'httpError': mockedHttpError
        });
    }));

    afterEach(function () {
        broadcastSpy.reset();
    });

    it('Testing the TeamCtrl', function () {
        expect(scope.team.user._id).to.be.eq(USER_ID);
        assert(Array.isArray(scope.team.userList), 'Should be empty when loaded first');
        assert(Array.isArray(scope.team.pendingInviteList), 'Should be empty when loaded first');
        assert(Array.isArray(scope.team.rejectInviteList), 'Should be empty when loaded first');
    });

    it('Cancel invites', function () {
        scope.team.cancelInvites();
        expect(scope.team.addUserInviteList.length).to.equal(0);
        expect(scope.team.newUserEmail).to.eq('');
        expect(scope.team.popoverIsOpen).to.eq(false);
    });

    it('Handle popover', function () {
        expect(scope.team.popoverIsOpen).to.eq(false);
        scope.team.handleOpenPopover();
        expect(scope.team.popoverIsOpen).to.eq(true);
    });

    it('Send Invites', function () {
        scope.team.addEmailToInviteList('test@test.com');
        expect(scope.team.addUserInviteList.length).to.equal(1);
        expect(scope.team.newUserEmail).to.equal('');
        scope.$apply();
        scope.team.sendInvites();
        expect(scope.team.addUserInviteList.length).to.equal(0);
        expect(scope.team.newUserEmail).to.eq('');
        expect(scope.team.popoverIsOpen).to.eq(false);
        expect(scope.team.pendingInviteList.length).to.eq(1);
        expect(scope.team.rejectInviteList.length).to.eq(0);
        expect(scope.team.userList.length).to.eq(1);
    });

    it('Fail to Set Owner if you are not the current owner', function () {
        var newUser = {name: 'Tester', _id: '26224027c98713450a0367d1'};
        scope.team.setOwner(newUser);
        expect(scope.team.newOwnerUser).to.eq(undefined);
        broadcastSpy.should.have.not.been.calledOnce;
    });

    it('Set Owner', function () {
        scope.team.user.role = 'owner';
        scope.team.userList[0] = scope.team.user;
        var newUser = {name: 'Tester', _id: '26224027c98713450a0367d1'};
        scope.team.setOwner(newUser);
        expect(scope.team.newOwnerUser).to.eq(newUser);
        expect(scope.team.user.role).to.eq('owner');
        broadcastSpy.should.have.been.calledOnce;
    });

    it('Refresh team', function () {
        scope.$apply();
        scope.team.refreshTeam();
        expect(scope.team.pendingInviteList.length).to.equal(1);
        expect(scope.team.rejectInviteList.length).to.equal(0);
        expect(scope.team.userList.length).to.equal(1);
    });

    it('Remove invite', function () {
        scope.$apply();
        scope.team.removeInvite(1);
        expect(scope.team.addUserInviteList.length).to.equal(0);
    });
});
