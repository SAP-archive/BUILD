'use strict';

describe('Norman Auth Client>>> Testing account.auth Module>>', function () {
	describe('Factory: Auth>>', function () {
		describe('Dependencies:', function () {
			it('should contain an User service',
				inject(function (User) {
					expect(User).not.to.equal(null);
				}));
		});

		var Auth, httpBackend;
        beforeEach(function () {
            module('account');
            inject(function ($httpBackend) {
                httpBackend = $httpBackend;
                httpBackend.whenGET('/legal/terms/privacy_statement_EN.txt').respond(200);
            });
            inject(function (_Auth_) {
                Auth = _Auth_;
            });
        });
		it('Create User>>', function () {
            var succeeded;

			// mocked api
			httpBackend.expectPOST('/api/users', {
				name: 'Ben',
				email: 'email@email.com',
				password: 'password'
			}).respond(200);

			// call
			Auth.createUser({
				name: 'Ben',
				email: 'email@email.com',
				password: 'password'
			})
			.then(function () {
				succeeded = true;
			});

			httpBackend.expectGET('/api/users/me').respond(200);
			httpBackend.flush();

			// test
			expect(succeeded).to.equal(true);
		});


		it('Login>>', function () {


			// mocked api
			httpBackend.expectPOST('/auth/local', {
				email: 'email@email.com',
				password: 'password'
			}).respond(200, 'token_abcd');

			// call
			Auth.login({
				email: 'email@email.com',
				password: 'password'
			})
			.then(function () {
			});

			// test
			httpBackend.expectGET('/api/users/me').respond(200);
			httpBackend.flush();
		});

		it('Logout', function () {


			// mocked api
			httpBackend.expectPOST('/auth/local', {
				email: 'email@email.com',
				password: 'password'
			}).respond(200, 'token_abcd');

			// call
			Auth.login({
				email: 'email@email.com',
				password: 'password'
			})
			.then(function () {
			});

			// test
			httpBackend.expectGET('/api/users/me').respond(200);
			httpBackend.flush();

			// call
			Auth.logout();
		});

		it('verifyEmail', function () {
			var data;
			httpBackend.expectGET('/api/users/verifyEmail_token/verifyEmail').respond(200, {
				status: 'unavailable',
				message: 'The resource you are looking for is not available.'
			});

			// call
			Auth.verifyEmail('verifyEmail_token')
			.$promise.then(function (res) {
				data = res;
			});

			httpBackend.flush();

			// test
			expect(data.status).to.equal('unavailable');
			expect(data.message).to.equal('The resource you are looking for is not available.');
		});

		it('resendVerificationEmail', function () {
			var data;
			httpBackend.expectGET('/api/users/email@email.com/resendVerificationEmail').respond(200);

			// call
			Auth.resendVerificationEmail('email@email.com')
			.then(function () {
				data = true;
			});

			httpBackend.flush();
			// test
			expect(data).to.equal(true);
		});

		it('changePassword', function () {
			var data;

			httpBackend.expectPUT('/api/users/password', {
				oldPassword: 'oldPassword',
				newPassword: 'newPassword'
			}).respond(200);

			// call
			Auth.changePassword('oldPassword', 'newPassword')
			.then(function (res) {
				data = res;
			});

			httpBackend.flush();

			// test
			expect(data.oldPassword).to.equal('oldPassword');
			expect(data.newPassword).to.equal('newPassword');
		});

		it('updateProfile', function () {
			var data;
			httpBackend.expectPUT('/api/users/profile', {
				name: 'john'
			}).respond(200);

			// call
			Auth.updateProfile({ name: 'john' })
			.then(function () {
				data = true;
			});

			httpBackend.flush();

			// test
			expect(data).to.equal(true);
		});


	});

	describe('Auth >> get Password Policy', function () {
		var Auth, httpBackend;
        beforeEach(function () {
            module('account');
            module('account.auth');
            inject(function ($httpBackend) {
                httpBackend = $httpBackend;
                httpBackend.whenGET('/legal/terms/privacy_statement_EN.txt').respond(200);
            });
            inject(function (_Auth_) {
                Auth = _Auth_;
            });
        });

		it('get Password Policy', function (done) {

			inject(function ($rootScope) {
				httpBackend.whenGET('/auth/policy').respond({
					policy: 'blah'
				});

				var message = Auth.getPasswordPolicy();
				httpBackend.flush();

				message.then(function (value) {
					expect(value.policy).to.be.eq('blah');
					done();
				})
				.catch(function (error) {
					done(error);
				});
				$rootScope.$apply();

			});
		});
	});
});
