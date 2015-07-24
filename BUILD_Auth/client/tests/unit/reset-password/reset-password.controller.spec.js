/*global chai, sinon, inject */
/*eslint no-unused-expressions:0 */
'use strict';
var expect = chai.expect;

describe('LoginCtrl', function () {
	var scope, window, auth, Q, form;
	var authGetPolicySpy;
	var isValid;
	/*** SETUP ************************************************************************************/
	beforeEach(function () {
        module('account');
        module('account.reset-password');
        inject(function ($httpBackend) {
            var httpBackend = $httpBackend;
            httpBackend.whenGET('/legal/terms/privacy_statement_EN.txt').respond(200);
        });
    });
	beforeEach(inject(function ($rootScope, $controller, $q) {
		Q = $q;
		form = {};
		form.confirmNewPassword = {
			$setValidity: function () {
				return;
			}
		};
		form.oldPassword = {
			$setValidity: function () {
				return;
			}
		};
		scope = $rootScope.$new();
		auth = {
			getPasswordPolicy: function () {
				var deferred = Q.defer();
				deferred.resolve({policy: ''});
				return deferred.promise;
			},
			resetPassword: function () {
				var deferred = Q.defer();
				var data = {};
				data.token = '123';

				if (isValid) {
					deferred.resolve(data);
				}
				else {
					deferred.reject();
				}

				return deferred.promise;
			}
		};

		authGetPolicySpy = sinon.spy(auth, 'getPasswordPolicy');
		window = {location: {}};
		$controller('ResetPasswordCtrl', {
			$scope: scope,
			Auth: auth,
			ResetPasswordTokenValidation: {},
			$stateParams: {id: 1},
			$window: window
		});
	}));
	/*** SETUP ************************************************************************************/


	/*** TESTS ************************************************************************************/

	it('Should set invalid if passwords not matching ', function () {
		isValid = true;

		authGetPolicySpy.should.have.been.called;
		var formSpy = sinon.spy(form.confirmNewPassword, '$setValidity');
		scope.user = {newPassword: 'password1', confirmNewPassword: 'notmatching'};

		scope.resetPassword(form);
		expect(scope.submitted).to.eq(true);
		formSpy.should.have.been.calledWith('notMatch', false);
		formSpy.reset();

	});

	it('should reset if passwords matching', inject(function ($httpBackend) {
		isValid = true;

        $httpBackend.expectGET('/api/users/me').respond(200);
		authGetPolicySpy.should.have.been.called;
		scope.user = {newPassword: 'password1', confirmNewPassword: 'password1'};

		var resetSpy = sinon.spy(auth, 'resetPassword');
		scope.resetPassword(form);
		expect(scope.submitted).to.eq(true);
		resetSpy.should.have.been.calledWith(1, 'password1');
		resetSpy();
		scope.$digest();
		expect(scope.message).to.eq('Password successfully changed.');
		expect(scope.errors.other).to.eq('');
		expect(window.location.href).to.eq('/norman');

	}));

	it('should catch error if error thrown in', function () {

		isValid = false;
		authGetPolicySpy.should.have.been.called;
		scope.user = {newPassword: 'password1', confirmNewPassword: 'password1'};

		var resetSpy = sinon.spy(auth, 'resetPassword');
		scope.resetPassword(form);
		resetSpy.should.have.been.calledWith(1, 'password1');
		resetSpy();
		// @todo fix to reach Catch for Auth.resetPassword
		/*
		var formSpy = sinon.spy(form.oldPassword, '$setValidity');
		formSpy.should.have.been.calledWith('mongoose', false);
		expect(scope.errors.other).to.eq('Incorrect password');
		expect(scope.message).to.eq('');
		*/
	});
});
