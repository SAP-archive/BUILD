 'use strict';
 describe('Norman Auth Client>>> Testing account.login Module', function () {
     beforeEach(function () {
         angular.mock.module('account');
         angular.mock.module('account.login');
         inject(function ($httpBackend) {
             var httpBackend = $httpBackend;
             httpBackend.whenGET('/legal/terms/privacy_statement_EN.txt').respond(200);
         });
     });

    describe('Dependencies:', function () {
        it('should have a LoginCtrl controller',
            inject(function ($rootScope, $controller) {
            var scope = $rootScope.$new();
            var ctrl = $controller('LoginCtrl', {$scope: scope});
            expect(ctrl).not.to.equal(null);
        }));
    });
});
