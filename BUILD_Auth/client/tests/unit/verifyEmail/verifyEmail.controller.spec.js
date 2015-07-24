/*global chai, sinon, inject */
/*eslint no-unused-expressions:0 */
'use strict';

var expect = chai.expect;

describe('VerifyEmailController>>', function () {
    var scope, location, window, emailVerification;

    /*** SETUP ************************************************************************************/
    beforeEach(function () {
        module('account');
        module('account.verifyEmail');
        inject(function ($httpBackend) {
            var httpBackend = $httpBackend;
            httpBackend.whenGET('/legal/terms/privacy_statement_EN.txt').respond(200);
        });
    });

    beforeEach(inject(function ($rootScope, $controller, $location, $window) {
        scope = $rootScope.$new();
        location = $location;
        window = $window;
        emailVerification = true;
        $controller('VerifyEmailCtrl', {
            $scope: scope,
            $location: location,
            $window: window,
            EmailVerification: emailVerification
        });

    }));
    /*** SETUP ************************************************************************************/



    /*** TESTS ************************************************************************************/
    it('should initialise vars', function () {
        expect(scope.EmailVerification).to.equal(true);
    });

});
