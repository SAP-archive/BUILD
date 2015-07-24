'use strict';

module.exports = angular.module('account.tos', ['ui.router'])
	.config(function ($stateProvider) {
		$stateProvider.state('tos', {
			url: '/tos',
			templateUrl: './resources/norman-auth-client/tos/tos.html',
			controller: 'TosCtrl'
		})
		.state('privacystatement', {
			url: '/privacystatement',
			templateUrl: './resources/norman-auth-client/tos/privacystatement.html',
			controller: 'TosCtrl'
		});
	})
    .service('tosService', require('./tos.service.js'))
    .directive('tosAutosize', require('./tos-autosize.directive.js'))
    .controller('TosCtrl', require('./tos.controller.js'));

