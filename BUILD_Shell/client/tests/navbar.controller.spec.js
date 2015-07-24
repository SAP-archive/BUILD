/*global chai, inject, sinon */
/*eslint no-unused-expressions: 0*/
'use strict';

describe('NavBarCtrl', function () {
    var scope, rootScope, location, controller, q,
        state = {
            go: function () {
            },
            current: {name: 'shell.projects'}
        },
        user = {name: 'test-user', preferences: {help: {disable: false}}},
        auth = {
            isLoggedIn: function () {
                return true;
            },
            logout: function () {
                return true;
            },
            getCurrentUser: function () {
                return {
                    $promise: {
                        then: function (cb) {
                            cb(user);
                        }
                    }
                };
            },
            getSecurityConfig: function () {
                var def = q.defer();
                def.resolve({
                    settings: {
                        registration: {
                            self: true,
                            social: true
                        },
                        provider: {
                            local: true
                        }
                    }
                });
                return def.promise;
            },
            getPreferences: function () {
                return {
                    then: function (cb) {
                        cb(user);
                    }
                };
            }
        },
        authAlt = {
            getCurrentUser: function () {
                return {};
            },
            getSecurityConfig: function () {
                var def = q.defer();
                def.resolve({
                    settings: {
                        registration: {
                            self: true,
                            social: true
                        },
                        provider: {
                            local: true
                        }
                    }
                });
                return def.promise;
            },
            getPreferences: function () {
                return {
                    then: function (cb) {
                        cb(user);
                    }
                };
            }
        },
        navBar = {
            logoState: 1, updateHeading: function () {
            }
        },
        createController = function () {
            controller('NavBarCtrl', {
                $state: state,
                $scope: scope,
                $location: location,
                Auth: auth,
                NavBarService: navBar
            });
        },
        createAltController = function () {
            controller('NavBarCtrl', {
                $state: state,
                $scope: scope,
                $location: location,
                NavBarService: {},
                Auth: authAlt
            });
        };


    /*** SETUP ************************************************************************************/
    beforeEach(module('shell.navbar'));
    beforeEach(inject(function ($rootScope, $location, $controller, $q) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        location = $location;
        controller = $controller;
        q = $q;
    }));
    /*** SETUP ************************************************************************************/


    /*** TESTS ************************************************************************************/
    it('should set vars correctly', function () {
        createController();
        expect(scope.logoState).to.equal(navBar.logoState);
        expect(scope.statusSelectedItem).to.equal(scope.status[0]);
        expect(scope.currentUser).to.equal(user);
        expect(scope.isLoggedIn).to.be.true;
    });


    it('should set vars to default', function () {
        createAltController();
        expect(scope.logoState).to.equal('shell');
        expect(scope.currentUser).to.be.null;
        expect(scope.isLoggedIn).to.be.false;
    });


    it('should activate correct path', function () {
        createController();
        location.path('');
        expect(scope.isActive('/')).to.be.true;

        location.path('test1');
        expect(scope.isActive('/test1')).to.be.true;
    });


    it('should logout', function () {
        createController();
        var logoutSpy = sinon.spy(auth, 'logout');

        scope.logout();
        logoutSpy.should.have.been.called;
    });


    it('should navigateToLanding', function () {
        createController();
        var stateSpy = sinon.spy(state, 'go');
        rootScope.currentProject = {name: 'project1'};
        scope.logoState = 'landing';

        scope.navigateToLanding();
        expect(rootScope.currentProject).to.be.null;
        stateSpy.should.have.been.calledWith(scope.logoState);
    });

});
