/**
 * Created by i311181 on 09 Feb 2015.
 */

'use strict';

var injectr = require('injectr'),
	path = require('path'),
	chai = require('norman-testing-tp').chai,
	sinon = require('sinon');
var	assert = chai.assert;

var commonServer = require('norman-common-server');

var userMocks = require('./user.mocks');
var DB_NAME = 'norman-auth-test-service';

// setup
function getConnection(cb, done) {

	if (commonServer.db.connection.connected) {

		cb(done);
	}
    else {
		commonServer.db.connection.initialize({database: DB_NAME}, function (err) {
			if (err) {
				console.error('Oops, no magic today: ', err);
				done(err);
			}
			else {

				cb(done);
			}
		});
	}


}
describe.skip('User Controller', function () {

	var UserController, req, res;

	before(function (done) {


		getConnection(function (done) {
			UserController = injectr('../../api/user/user.controller.js', {

				'./user.model': userMocks.model,
				'../../mailTemplate': {},
				'../../auth.service': {},
				'norman-common-server': {
					logging: {
						createLogger: function () {
							return function () {
							};
						}
					},
					Mailer: {
						sender: ''
					}
				},
				'../user-audit/user-audit.controller.js': {},
				'./user.service': userMocks.service,
				jsonwebtoken: userMocks.mockedJwToken

			}, {
				__dirname: path.join(__dirname, '../../api/user/'),
				console: console
			});
			done();

		}, done);

	});
	after(function (done) {
		commonServer.db.connection.disconnect(done);
		// done();
	});

	beforeEach(function () {
		req = {
			host: 'some-where',
			body: {_id: '123'}
		};
		function status() {
			return function () {};
		}

		res = {
			status: new status()
		};
	});

	it('Cannot change password without current password', function (done) {
		var jwtTokenSpy = sinon.spy(userMocks.mockedJwToken, 'sign');
		var resStatusSpy = sinon.spy(res, 'status');

		UserController.create(req, res);

		// timeout used to ensure promise resolved in mocked functions
		setTimeout(function () {

			assert(jwtTokenSpy.calledOnce);
			assert(resStatusSpy.calledOnce);

			done();
		}, 100);


	});


});
