'use strict';
module.exports = angular.module('account.passwordpolicy', [])
	.service('passwordPolicyService', require('./policy.service.js'))
	.directive('passwordPolicy', require('./passwordPolicy.directive'));
