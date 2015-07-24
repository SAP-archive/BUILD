'use strict';

module.exports = angular.module('account.login', [])
	.config(function ($stateProvider) {
		$stateProvider.state('login', {
			url: '/login',
			templateUrl: './resources/norman-auth-client/login/login.html',
			controller: 'LoginCtrl'
		});
	})
	.controller('LoginCtrl', require('./login.controller'));
