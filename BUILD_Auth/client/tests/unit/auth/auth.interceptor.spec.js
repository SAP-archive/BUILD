/*eslint no-unused-expressions: 0 */
'use strict';
var expect = chai.expect;
describe('Norman Auth Client>> Factory: authInterceptor', function () {
	beforeEach(module('account.auth'));
	it('should have a working service that redirect you to tos page in 403s error',
		inject(['authInterceptor', '$cookieStore', '$location', '$rootScope', function (authInterceptor, $cookieStore, $location, $rootScope) {
            $rootScope.showPrivacyStmt = true;
            var locationSpy = sinon.spy($location, 'path');
            var responseError = {status: 403};
            responseError.headers = function (param) {
                if (param === 'registration') {
                    return 'required';
                }
            };
			var result = authInterceptor.responseError(responseError);

			locationSpy.should.have.been.called;

			result.catch(function (response) {
				expect(response.status).to.be.eq(403);
			});
		}]));
});
