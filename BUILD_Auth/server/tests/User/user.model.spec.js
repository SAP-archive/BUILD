'use strict';

var User;
var crypt = require('../../lib/services/user/user.crypto.js'),
    chai = require('norman-testing-tp').chai;

var should = chai.should(),
	expect = chai.expect,
	user,
	userObj = {
		provider: 'local',
		name: 'Fake User',
		email: 'test@test.com',
		password: 'Password123!'
	},

	auth = function (params) {
		var deferred = Promise.defer();
		var email = params.email || userObj.email;
		var password = params.password;
		User.getAuthenticated(email, password, function (error, usr, reason) {
			params.user = usr;
			params.error = error;
			params.reason = reason;

			if (error || reason) {
				deferred.reject(params);
			}
			else {
				deferred.resolve(params);
			}
		});
		// deferred.resolve(params);
		return deferred.promise;
	};

var commonServer = require('norman-common-server');
var auditServer = require('norman-audit-server');
var DB_NAME = 'norman-auth-test';

function setup(done) {
	User = require('../../lib/services/user/user.model');
    auditServer.initialize(done);
}

describe.skip('User Model', function () {
	this.timeout(15000);

	before(function (done) {

		if (commonServer.db.connection.connected) {
			setup(done);
		}
        else {
			commonServer.db.connection.initialize({database: DB_NAME}, function (err) {
				if (err) {
					console.error('Oops, no magic today!');
				}
				else {
					console.log('Connected!');
					setup(done);

				}
			});
		}


	});

	beforeEach(function (done) {
		user = new User(userObj);
		User.remove().exec().then(function () {  // Clear users before testing
			done();
		}, function (error) {
			console.error('User Model \'beforeEach\' Error: ', error);
		});

	});

	after(function (done) {
		User.remove().exec().then(function () {
			// commonServer.db.connection.disconnect(function(){

			commonServer.db.connection.disconnect(done);
			// });
		}, function (error) {
			console.error('User Model \'afterEach\' Error: ', error);
		});
	});



	it('should begin with no users', function (done) {
		User.find({}, function (error, users) {
			should.not.exist(error);
			expect(users).to.have.length(0);
			done();
		});
	});


	it('should be able to save and get new user', function (done) {
		user.save(function (error) {
			should.not.exist(error);
			User.find({}, function (err, users) {
				should.not.exist(err);
				expect(users).to.have.length(1);
				done();
			});
		});
	});


	it('should fail when saving a duplicate user', function (done) {
		user.save(function () {
			var userDup = new User(userObj);
			userDup.save(function (err) {
				should.exist(err);
				done();
			});
		});
	});


	it('should fail when saving without an email', function (done) {
		user.email = '';
		user.save(function (err) {
			should.exist(err);
			done();
		});
	});


	it('should authenticate user if password is valid', function (done) {
		user.save(function (error) {
			should.not.exist(error);

			auth({password: userObj.password})
				.then(function (params) {
					should.exist(params.user);
					done();
				})
				.catch(function (err) {
					done(err);
				});
		});
	});

	it('should not authenticate user if password is invalid', function (done) {
		user.save(function (error) {
			should.not.exist(error);

			auth({password: 'incorrect password'})
				.catch(function (params) {
					try {
						should.not.exist(params.user);
						expect(params.reason).to.eq(1);
						done();
					}
                    catch (e) {
						done(e);
					}
				});


		});
	});

	it('should not authenticate user if not registered', function (done) {
		auth({password: 'incorrect password', email: 'user@notregister.ed'})
			.then(function (params) {
				should.not.exist(params.user);
				done();
			})
			.catch(function (e) {
				done(e);
			});
	});


	it('should lock the user account if entered incorrect password 5 times', function (done) {
		user.save(function (error) {
			should.not.exist(error);


			auth({password: 'incorrect password'})
				.catch(auth)
				.catch(auth)
				.catch(auth)
				.catch(auth)
				.catch(auth)
				.catch(function (params) {
					// console.error('err', params);
					try {
						should.not.exist(params.user);
						expect(params.error).to.equal(2);    // "MAX_ATTEMPTS" code is "2"
						done();
					}
                    catch (e) {
						done(e);
					}
				});
		});
	});


	it('should unlock the user account after a period', function (done) {
		var timeout = 500;
		user.lock_until = Date.now() + timeout;
		user.save(function (error) {
			should.not.exist(error);

			auth({password: userObj.password})
				.then(function (params) {
					should.not.exist(params.user);
					// expect(params.error).to.equal(2);    // "MAX_ATTEMPTS" code is "2"
					setTimeout(function () {
						auth({password: userObj.password})
							.then(function (params) {
								should.exist(params.user);
								done();
							})
							.catch(function (e) {
								done(e);
							});
					}, timeout);
				})
				.catch(function (err) {
					try {
						should.not.exist(err.user);
						expect(err.error).to.equal(2);    // "MAX_ATTEMPTS" code is "2"
						done();
					}
                    catch (e) {
						done(e);
					}
				});


		});
	});


	it('should rehash the password if it was hashed with lower iteration count', function (done) {

		user.save(function (error) {
			should.not.exist(error);
			user.update({$set: {iterationCount: crypt.iterationCount - 1}}, function (error) {

				should.not.exist(error);
				// authentication should trigger re-hashing
				auth({password: userObj.password})
					.then(function (params) {
						should.exist(params.user);
						expect(user.password).to.not.equal(params.user.password);
						done();
					})
					.catch(function (err) {
						done(err);
					});
			});
		});
	});
});
