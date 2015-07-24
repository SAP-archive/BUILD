'use strict';

var expect = require('norman-testing-tp').chai.expect;
var path = require('path');

var commonServer = require('norman-common-server');
var registry = commonServer.registry;

var PassportRestApi = require('../api/PassportRestApi');
var passportApi = new PassportRestApi();


var fs = require('fs');

require('../../bin/test-app.js');


var USER_NAME = 'user a',
	USER_EMAIL = 'user@test.local',
	USER_PASSWORD = 'Minisap!1';

describe('Passport REST API Test', function(){
	this.timeout(15000);

	before('Initialize passportApi', function(done){
		passportApi.initialize()
			.then(function(){
				done();
			});
	});

	after(function(done){
		passportApi.resetDB(done);
	});

    it('Features>>Get features>>', function(done){
        passportApi.features(200, function(err, data){
            expect(err).to.be.eq(null);
            expect(data.body).to.exist;
            expect(data.body).to.not.eq(null);
            expect(data.body.features).to.not.eq(null);
            expect(data.body.features['disable-prototype'].enabled).to.eq(false);
            done();
        });

    });

 	it('Signup>>Perform account signup test>>', function(done){
		var user = {
			name : USER_NAME,
			email: USER_EMAIL,
			password:USER_PASSWORD
		};

		passportApi.signup(user, 201, function(err, data){
			expect(err).to.be.eq(null);
			expect(data.body).to.exist;
			expect(data.body).to.not.eq(null);
			done();
		});

	});

	it('Login>>Perform account login test>>', function(done){
		var user = {
			email: USER_EMAIL,
			password:USER_PASSWORD
		};

		passportApi.login(user, 200, function(err, data){
			expect(err).to.be.eq(null);
			expect(data.body).to.exist;
			expect(data.body).to.not.eq(null);
			done();
		});

	});

	it('Local>>Perform account login test>>', function(done){
		var user = {
			email: USER_EMAIL,
			password:USER_PASSWORD
		};

		passportApi.local(user, 200, function(err, data){
			expect(err).to.be.eq(null);
			expect(data.body).to.exist;
			expect(data.body).to.not.eq(null);
			done();
		});

	});


	it('Logout>>Perform account logout test>>', function(done){

		passportApi.logout(302, function(err, data){
			expect(err).to.be.eq(null);
			expect(data.body).to.exist;
			expect(data.body).to.not.eq(null);
			done();
		});

	});

	it('Logout>>Perform policy api test>>', function(done){

		passportApi.policy(200, function(err, data){
			expect(err).to.be.eq(null);
			expect(data.body).to.exist;
			expect(data.body).to.not.eq(null);
			done();
		});

	});

});
