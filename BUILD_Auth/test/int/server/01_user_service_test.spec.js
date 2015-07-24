'use strict';

var expect = require('norman-testing-tp').chai.expect;
var path = require('path');

var commonServer = require('norman-common-server');
var registry = commonServer.registry;

var UsersRestApi = require('../api/UsersRestApi');
//userApi initialised with no user
var userApi = new UsersRestApi();
//userApi initialised with user
var aUser = new UsersRestApi();

var USER_NAME = 'user a',
	USER_EMAIL = 'user@test.local',
	USER_PASSWORD = 'Minisap!1',
	USER_NAME_2 = 'user two',
	USER_EMAIL_2 = 'user2@test.local',
	USER_PASSWORD_2 = 'Minisap!1',
	ANOTHER_PASSWORD = 'Minisap!3',
    NO_ACCCESS_DOMAIN = '@noway.com';


var fs = require('fs');

var aUserId, request_password_token;
var testLogger = commonServer.logging.createLogger("test.users");

var TEST_TIMEOUT = 20000;

describe('Signup - User REST API Test', function () {
    if ((this.timeout() > 0 ) && (this.timeout() < TEST_TIMEOUT)) {
        // Do not override explicit timeout settings, e.g. through --timeout command line option when debugging
        this.timeout(TEST_TIMEOUT);
    }

    before('Initialize userApi', function (done) {
        userApi.initialize()
            .then(function () {
                //Add a no access rule
                var accessService = registry.getModule("AccessService");
                var noAccessDomain = { _id: NO_ACCCESS_DOMAIN};
                return accessService.create(noAccessDomain);
            })
            .then(function () {
                done()
            })
            .catch(function (err) {
                testLogger.error(err, "Failed to initialize userApi requester");
                done(err);
            });
    });

	before('Initialize aUser', function (done) {
		aUser.initialize(USER_EMAIL_2, USER_PASSWORD_2)
			.then(function () {
                done();
            })
			.catch(function (err) {
                testLogger.error(err, "Failed to initialize aUser requester");
                done (err);
            });
	});

	after(function (done) {
		userApi.resetDB(done);
		//done();
	});
	// POST '/'

	it('Create a new User', function (done) {
		var user = {
			name: USER_NAME,
			principle:USER_EMAIL,
			email: USER_EMAIL,
			password: USER_PASSWORD
		};
		userApi.createUser(user, 201, function (err, token) {
            if (err) {
                done(err);
            }
            else if (!token) {
                done(new Error("Missing auth token"));
            }
            else {
                done();
            }
        });
	});

	// POST '/'
	it('Negative test - Should not Create duplicate local User', function (done) {
		var user = {
			name: USER_NAME,
			principle:USER_EMAIL,
			email: USER_EMAIL,
			password: USER_PASSWORD
		};
		userApi.createUser(user, 404, done);

	});

	// POST '/'
	it('[Negative test] - Should not Create User without Password', function (done) {
		var user = {
			name: 'fake user',
 			email: 'fake@mail.local'
		};
		userApi.createUser(user, 404, done);

	});

	// POST '/'
    it('[Negative test] - Should not Create User without email', function (done) {
        var user = {
            name: 'fake user',
            password: 'password'
        };
        userApi.createUser(user, 404, done);

    });

    it('Should not create at all unauthorized user', function (done) {
        var user = {
            name: 'fake user',
            password: 'password',
            email: 'fake' + NO_ACCCESS_DOMAIN
        };
        userApi.createUser(user);
        aUser.findModel({email: 'fake@no.com'})
            .then(function (doc) {
                expect(doc.length).to.be.eq(0);
                done();
            })
            .catch(done)

    });


	// POST '/'
	/*it('[Negative test] - Should not Create User without user\' Name', function (done) {
		var user = {
			email: 'fake@mail.local',
			password: 'password'
		};
		userApi.createUser(user, 500, done);

	});*/

	// GET '/me'
	it('Get User (me)', function (done) {
		aUser.me(200, function (err, res) {
            try {

                expect(aUser.isContentTypeJSON(res)).to.be.true;
                var user = res.body;
                expect(user.name).to.eq(USER_EMAIL_2);
                expect(user.email).to.eq(USER_EMAIL_2);
                expect(user.has_email_verified).to.eq(false);
                expect(user.acl_roles).to.exist;
                expect(user.acl_roles).to.be.instanceof(Array);
                expect(user.acl_roles.length).to.be.eq(1);
                aUserId = user._id;
                done();
            }
            catch(error) {
                done(error);
            }
		});
	});

	// GET '/:id/profile'
	it('Get User (id)', function (done) {

		//aUser.show()
		done();
	});

    // PUT '/:id/profile'
    it('Update User\'s name', function (done) {
        aUser.updateProfile(aUserId, {name: USER_NAME_2, email: USER_EMAIL_2}, 200, function () {
            aUser.me(200, function (err, res) {
                try {
                    expect(err).to.be.eq(null);
                    expect(res.body.name).to.eq(USER_NAME_2);
                    expect(res.body.email).to.eq(USER_EMAIL_2);
                    done();
                }
                catch(error) {
                    done(error);
                }
            });

        });
    });

	// PUT '/:id/password'
	it('Update User\'s Password', function (done) {
		var updatedPassword = 'Minisap!2';
		aUser.findModel({_id: aUserId})
			.then(function (doc) {
				expect(doc[0].password_history.length === 0);
				aUser.changePassword(aUserId, {
					oldPassword: USER_PASSWORD_2,
					newPassword: updatedPassword
				}, 200, function () {
					aUser.findModel({_id: aUserId})
						.then(function (updatedDoc) {
							// expect history to be incremented
							expect(updatedDoc[0].password_history.length === 1);
							var passwordMatch = aUser.passwordCheck(updatedDoc[0], updatedPassword);
							// expect Password to match
							expect(passwordMatch).to.be.eq(true);
							done();
						}).catch(done)
				});
			})
			.catch(done);

	});

	// PUT '/:id/avatar'
	it('Update User\'s Avatar', function (done) {
		aUser.changeAvatar(aUserId, path.resolve(__dirname, '../testAssets/Large.png'), 200, function () {
			aUser.findModel({email: USER_EMAIL_2})
				.then(function (doc) {
					expect(doc[0]['_id'].toString()).to.eq(aUserId);
					//verify the saved bin is matches the binary base64 String of the file
					var content = fs.readFileSync(path.resolve(__dirname, '../testAssets/Large.png'));
					var base64Content = new Buffer(content, 'binary').toString('base64');
					expect(doc[0]['avatar_bin']).to.eq(base64Content);
					done();

				}).catch(function (err) {
					done(err);
				});
		});
	});

	// GET '/:id/requestPwd'
	it('Request Password Change for User', function (done) {
		aUser.findModel({email: USER_EMAIL_2})
			.then(function (doc) {
				expect(doc[0].request_password_token).to.not.exist
                aUser.requestPasswordChange(USER_EMAIL_2, 200, function () {
					aUser.findModel({email: USER_EMAIL_2})
						.then(function (updatedDoc) {
							expect(updatedDoc[0].request_password_token).to.exist;
							request_password_token = updatedDoc[0].request_password_token;
							expect(updatedDoc[0].request_password_token_expired).to.exist;
							done();
						})
						.catch(done)
				});
			})
			.catch(done)

	});

	// GET '/:id/resetPassword'
	it('Reset Password for User', function (done) {

		aUser.findModel({email: USER_EMAIL_2})
			.then(function (doc) {
				expect(doc[0].request_password_token).to.exist
				expect(doc[0].request_password_token).to.eq(request_password_token);
                aUser.resetPassword(request_password_token, {newPassword: ANOTHER_PASSWORD}, 200, function () {
					aUser.findModel({email: USER_EMAIL_2})
						.then(function (updatedDoc) {
							expect(updatedDoc[0].password_history.length === 1);
							var passwordMatch = aUser.passwordCheck(updatedDoc[0], ANOTHER_PASSWORD);
							// expect Password to match
							expect(passwordMatch).to.be.eq(true);
							done();
						})
						.catch(done)
				});
			})
			.catch(done)

	});

	// GET '/:id/resendVerificationEmail'
	it('Resend Verification Email', function(done){
		aUser.findModel({email: USER_EMAIL_2})
			.then(function (doc) {
				aUser.resendVerificationEmail(doc[0].email, 200, done);

			})
			.catch(done);
	});

    // GET '/:id/verifyEmail' id = email
	it('Verify Email for User', function(done){

		aUser.findModel({email: USER_EMAIL_2})
			.then(function (doc){
				expect(doc[0].has_email_verified).to.be.eq(false);
				expect(doc[0].email_verified_token).to.exist;
				expect(doc[0].email_verified_token_expired).to.exist;
				aUser.verifyEmail(doc[0].email_verified_token, 200,function(){
					aUser.findModel({email: USER_EMAIL_2})
						.then(function (updatedDoc) {
							expect(updatedDoc[0].has_email_verified).to.be.eq(true);
							done();
						})
						.catch(done);
				});
			})
			.catch(done);
	});

	// DELETE '/:id'
    /*
	it('Delete User', function(done){
		aUser.findModel({email: USER_EMAIL})
			.then(function (doc){
				expect(doc.length).to.eq(1);
				aUser.deleteUser(doc[0]._id, 204, function(){
					userApi.findModel({email: USER_EMAIL})
						.then(function(updatedDoc){
							expect(updatedDoc.length).to.eq(0);
							done();
						});
				});

			})
            .catch(done);
	});
	*/

    it('Verify importUsers', function(done) {
        var newUsers = [
            {email:'test1@test.com', name:'test1', provider:'principal-propagation', principal: 'test1@test.com'},
            {email:'test2@test.com', name:'test2', provider:'principal-propagation', principal: 'test2@test.com'},
            {email:'test3@test.com', name:'test3', provider:'principal-propagation', principal: 'test3@test.com'}
        ];
        var testContext = {
            ip: '::1',
            user: {
                _id: '0',
                name: 'Test'
            }
        };
        var userService = registry.getModule('UserService');
        userService.importUsers(newUsers, testContext)
            .then(function (importedUsers) {
                expect(importedUsers).to.exists;
                expect(importedUsers.length).to.eq(3);
                done();
            })
            .catch(done);
    });

    it('Verify filteredList', function(done) {
        var userService = registry.getModule('UserService');
        userService.filteredList('email provider', {provider : {$ne : 'local'} })
            .then(function (results) {
                expect(results).to.exist;
                expect(results.length).to.be.eq(3);
                expect(results[0].email).to.be.eq('test1@test.com');
                expect(results[1].email).to.be.eq('test2@test.com');
                expect(results[2].email).to.be.eq('test3@test.com');
                done();
            })
            .catch(done);
    });

});

