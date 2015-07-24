 'use strict';
 describe('Norman Auth Client>>> Testing account.auth Module', function () {
  describe('account.auth Module>>', function () {

    beforeEach(function () {
        angular.mock.module('account');
        inject(function ($httpBackend) {
            var httpBackend = $httpBackend;
            httpBackend.whenGET('/legal/terms/privacy_statement_EN.txt').respond(200);
        });
    });
    var module;
    before(function () {
      module = angular.module('account.auth');
    });

    it('should be registered', function () {
      expect(module).not.to.equal(null);
    });

    describe('Dependencies:', function () {

      it('should have authInterceptor factory as a dependency',
        inject(function (authInterceptor) {
        expect(authInterceptor).not.to.equal(null);
      }));

      it('should have Auth factory as a dependency',
        inject(function (Auth) {
        expect(Auth).not.to.equal(null);
      }));

      it('should have User factory as a dependency',
        inject(function (User) {
        expect(User).not.to.equal(null);
      }));

    });
  });
});
