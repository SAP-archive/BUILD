'use strict';

require('./tos');
require('./signup');
require('./settings');
require('./login');
require('./auth');
require('./verifyEmail');
require('./forgot-password');
require('./reset-password');
require('./avatar');

module.exports = angular
    .module('account', [
        'ngCookies',
        'ui.router',
        'ngMessages',
        'angularMoment',
		'account.tos',
        'account.signup',
        'account.settings',
        'account.login',
        'account.auth',
        'account.verifyEmail',
        'account.forgot-password',
        'account.reset-password',
        'account.avatar',
        'common.ui.elements'

    ])
    .constant('OAUTH', {
        GOOGLE: {enable: false},
        FACEBOOK: {enable: false},
        LINKEDIN: {enable: false}
     })
    .run(function () {
    });
