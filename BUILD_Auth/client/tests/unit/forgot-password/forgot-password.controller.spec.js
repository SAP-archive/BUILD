/*global chai, sinon, inject */
/*eslint no-unused-expressions:0 */
'use strict';
var expect = chai.expect;

describe('Forgot Password Controller', function () {
    var scope, auth;

    /*** SETUP ************************************************************************************/

    beforeEach(function () {
        module('account');
        module('account.forgot-password');
        inject(function ($httpBackend) {
            var httpBackend = $httpBackend;
            httpBackend.whenGET('/legal/terms/privacy_statement_EN.txt').respond(200);
        });
    });
    beforeEach(inject(function ($rootScope, $controller, Auth) {
        scope = $rootScope.$new();
        auth = Auth;
        $controller('ForgotPasswordCtrl', {
            $scope: scope,
            Auth: auth
        });

    }));
    /*** SETUP ************************************************************************************/


    /*** TESTS ************************************************************************************/
    it('should initialise vars', function () {
        scope.errors.should.be.an('object');
		expect(scope.formHasErrors).to.equal(false);
		expect(scope.formHasErrors).to.equal(false);
    });

    it('should call request Password', inject(function ($httpBackend) {
        var form = { $valid: true };

         // mocked api
        $httpBackend.expectGET('/auth/email@email.com/requestPwd')
        .respond(200, {
            message: 'Successfull'
        });

        scope.user = {email: 'email@email.com'};
        scope.requestPwd(form);
        scope.$apply();

        $httpBackend.flush();
        expect(scope.message).to.equal('Successfull');
    }));

	it('should call request Password with nofound message ', inject(function ($httpBackend) {
        var form = { $valid: true };

         // mocked api
        $httpBackend.expectGET('/auth/email@email.com/requestPwd')
        .respond(200, {
            status: 'nofound',
            message: 'Successfull'
        });

        scope.user = {email: 'email@email.com'};
        scope.requestPwd(form);
        scope.$apply();

        $httpBackend.flush();
        expect(scope.message).to.equal('Successfull');
    }));

	it('[Negative Test] should failled to call request Password', inject(function ($httpBackend) {
        var form = { $valid: true };

         // mocked api
        $httpBackend.expectGET('/auth/email@email.com/requestPwd')
        .respond(500, { error: {message: 'Failed'} });

        scope.user = {email: 'email@email.com'};
        scope.requestPwd(form);
        scope.$apply();

        $httpBackend.flush();
        expect(scope.formHasErrors).to.be.true;
    }));

});
