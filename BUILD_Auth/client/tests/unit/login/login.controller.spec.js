/*global chai, sinon, inject */
/*eslint no-unused-expressions:0 */
'use strict';
var expect = chai.expect;

describe('LoginCtrl', function () {
    var scope, location, window, auth, oAUTH;
    /*** SETUP ************************************************************************************/
    beforeEach(function () {
        module('account');
        module('account.login');
        inject(function ($httpBackend) {
            var httpBackend = $httpBackend;
            httpBackend.whenGET('/legal/terms/privacy_statement_EN.txt').respond(200);
        });
    });
    beforeEach(inject(function ($rootScope, $controller, $location, $window, $q, Auth, OAUTH) {
        scope = $rootScope.$new();
        location = $location;
        auth = Auth;
		auth.getSecurityConfig = function () {
			var def = $q.defer();
			def.resolve({settings: {
				registration: {
					self: true,
					social: true
				},
				provider: {
					local: true
				}
			}});
			return def.promise;
		};
        oAUTH = OAUTH;
        window = $window;
        $controller('LoginCtrl', {
            $scope: scope,
            $location: location,
            $window: window,
            Auth: auth,
            OAUTH: oAUTH
        });

    }));
    /*** SETUP ************************************************************************************/




    /*** TESTS ************************************************************************************/

    it('should initialise vars', function () {
        expect(scope.OAUTH).to.equal(oAUTH);
        expect(scope.formHasErrors).to.be.false;
    });

    it('should login', inject(function ($httpBackend) {
        var form = { $valid: true };

         // mocked api
        $httpBackend.expectPOST('/auth/local', {
            email: 'email@email.com',
            password: 'password'
        }).respond(200, {
            token: 'token_abcd'
        });

        scope.user = {principal: 'email@email.com', password: 'password'};
        scope.login(form);
        scope.$apply();

        $httpBackend.expectGET('/api/users/me').respond(200);
        $httpBackend.flush();
        expect(scope.formHasErrors).to.be.false;
        expect(scope.submitted).to.be.true;

    }));

    it('should call login with pstatus = 202', inject(function ($controller, $httpBackend) {
        var form = { $valid: true };
        location.search('pstatus', '202');
        $controller('LoginCtrl', {
            $scope: scope,
            $location: location,
            $window: window,
            Auth: auth,
            OAUTH: oAUTH
        });

         // mocked api
        $httpBackend.expectPOST('/auth/local', {
            email: 'email@email.com',
            password: 'password'
        }).respond(200, {
            token: 'token_abcd'
        });

        scope.user = {principal: 'email@email.com', password: 'password'};
        scope.login(form);
        scope.$apply();

        $httpBackend.expectGET('/api/users/me').respond(200);
        $httpBackend.flush();
        expect(scope.formHasErrors).to.be.false;
        expect(scope.submitted).to.be.true;
        expect(scope.info).to.equal('An Email has been sent with password reset instructions');

    }));


     it('should call login with pstatus = 204', inject(function ($controller, $httpBackend) {
        var form = { $valid: true };
        location.search('pstatus', '204');
        $controller('LoginCtrl', {
            $scope: scope,
            $location: location,
            $window: window,
            Auth: auth,
            OAUTH: oAUTH
        });

         // mocked api
        $httpBackend.expectPOST('/auth/local', {
            email: 'email@email.com',
            password: 'password'
        }).respond(200, {
            token: 'token_abcd'
        });

        scope.user = {principal: 'email@email.com', password: 'password'};
        scope.login(form);
        scope.$apply();

        $httpBackend.expectGET('/api/users/me').respond(200);
        $httpBackend.flush();
        expect(scope.formHasErrors).to.be.false;
        expect(scope.submitted).to.be.true;
        expect(scope.info).to.equal('Successfully updated');

    }));

    it('[Negative Test] should login failed', inject(function ($httpBackend) {
        var form = { $valid: true };

         // mocked api
        $httpBackend.expectPOST('/auth/local', {
            email: 'email@email.com',
            password: 'password'
        }).respond(500, {
            message: 'failed'
        });

        scope.user = {principal: 'email@email.com', password: 'password'};
        scope.login(form);
        scope.$apply();
        $httpBackend.flush();
        expect(scope.submitted).to.be.true;
        expect(scope.formHasErrors).to.be.true;
        expect(scope.errors.other).to.equal('failed');

    }));

});
