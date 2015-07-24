/*global chai, sinon, window, inject */
'use strict';

var expect = chai.expect;

describe('Signup Controller', function () {
	var deferred, isSuccessful, rootScope, scope, window, location, OAUTH, uiError;

	function isEmpty(map) {
		for (var key in map) {
			if (map.hasOwnProperty(key)) {
				return false;
			}
		}
		return true;
	}

	beforeEach(module('account.signup'));

	beforeEach(inject(function ($controller, $q, $rootScope) {
		rootScope = $rootScope;
		scope = $rootScope.$new();
		var mockedAuthService = {};
		deferred = $q.defer();

		mockedAuthService.getSecurityConfig = function () {
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

		mockedAuthService.signup = function () {

			if (isSuccessful) deferred.resolve();
			else {
				var err = new Error('Couldn\'t register');
				err.data = {
					errors: {
						name: {
							message: 'invalid name'// ,
							// $setValidity: function () {return true;}
						},
						password: {
							message: 'invalid password'// ,
							// $setValidity: function () {return true;}
						}
					}
				};
				deferred.reject(err);
			}

			return deferred.promise;

		};
		mockedAuthService.getPasswordPolicy = function () {
			var def = $q.defer();

			def.resolve({});

			return def.promise;

		};

		location = {};
		location.path = function () {
			return true;
		};
		window = {};
		window.location = {};
		window.location.href = '';

        uiError = {
            dismiss: function () {
            }
        };

		$controller('SignupCtrl', {
			$scope: scope,
			Auth: mockedAuthService,
			$location: location,
			$window: window,
			OAUTH: OAUTH,
            uiError: uiError
		});

	}));


	it('Testing Sign up register Success', function () {
		expect(isEmpty(scope.errors)).to.be.eq(true);
		expect(isEmpty(scope.user)).to.be.eq(true);
		var form = {
			$valid: true
		};
		scope.user = {
			terms: true,
			name: 'John Smith',
			email: 'john.smith@somewhere.com',
			password: 'password'
		};

		var locationSpy = sinon.spy(location, 'path');
		isSuccessful = true;
		scope.register(form);
		rootScope.$apply();
		locationSpy.should.have.been.calledWith('/norman');
	});


	it('Testing Sign up register Not Successful', function () {
		expect(isEmpty(scope.errors)).to.be.eq(true);
		expect(isEmpty(scope.user)).to.be.eq(true);
		var form = {
			$valid: true,
			name: {
				value: '',
				$setValidity: function () {
					return true;
				}
			},
			password: {
				value: '',
				$setValidity: function () {
					return true;
				}
			}
		};
		scope.user = {
			terms: true,
			name: 'John Smith',
			email: 'john.smith@somewhere.com',
			password: 'password'
		};

		/*var nameInvalidSpy = sinon.spy(form.name, '$setValidity');
		var passwordInvalidSpy = sinon.spy(form.password, '$setValidity');*/
		isSuccessful = false;
		scope.register(form);
		rootScope.$apply();
		/*nameInvalidSpy.should.be.calledWith('mongoose', false);
		passwordInvalidSpy.should.be.calledWith('mongoose', false);*/

	});


	it('Testing Sign up register Not Successful: Case Multiple errors', function () {
		expect(isEmpty(scope.errors)).to.be.eq(true);
		expect(isEmpty(scope.user)).to.be.eq(true);
		var form = {
			$valid: true,
			name: {
				value: '',
				$setValidity: function () {
					return true;
				}
			},
			password: {
				value: '',
				$setValidity: function () {
					return true;
				}
			}
		};
		scope.user = {
			terms: true,
			name: 'John Smith',
			email: 'john.smith@somewhere.com',
			password: 'password'
		};

		/*var nameInvalidSpy = sinon.spy(form.name, '$setValidity');
		var passwordInvalidSpy = sinon.spy(form.password, '$setValidity');*/
		isSuccessful = false;
		scope.register(form);
		rootScope.$apply();
		/*nameInvalidSpy.should.be.calledWith('mongoose', false);
		passwordInvalidSpy.should.be.calledWith('mongoose', false);*/

	});

	it('Testing Sign up clearFieldErrors', function () {
		var form = {
			$valid: true,
			name: {
				$setValidity: function () {
					return true;
				}
			},
			password: {
				$setValidity: function () {
					return true;
				}
			}
		};

		var nameErrorClearedSpy = sinon.spy(form.name, '$setValidity');
		var passwordErrorClearedSpy = sinon.spy(form.password, '$setValidity');

		scope.clearFieldErrors(form, 'name');
		nameErrorClearedSpy.should.be.calledWith('mongoose', true);

		scope.clearFieldErrors(form, 'password');
		passwordErrorClearedSpy.should.be.calledWith('mongoose', true);

	});


});
