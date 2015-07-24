  'use strict';
var expect = chai.expect;
var accountModule;
var requiredDeps = [
    'account.signup',
    'account.settings',
    'account.login',
    'account.auth',
    'account.verifyEmail',
    'account.forgot-password',
    'account.reset-password',
    'account.avatar',
    'common.ui.elements'
];

 var availableDeps;

 var hasModule = function (dep) {
      return availableDeps.indexOf(dep) >= 0;
};

 describe('Norman Auth Client>> Dependencies test for account module', function () {
    before(function () {
        accountModule = angular.module('account');
        availableDeps = accountModule.value('appName').requires;
    });

    it('account module should be registered', function () {
        expect(accountModule).not.to.equal(null);
    });

    it('should have registered all the required dependencies', function () {
        var i;
        for (i = 0; i < requiredDeps.length; i++) {
          expect(hasModule(requiredDeps[i])).to.equal(true);
        }
    });
});
