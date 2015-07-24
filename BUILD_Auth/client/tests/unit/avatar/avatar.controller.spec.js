/*global chai, sinon, inject */
/*eslint no-unused-expressions:0 */
'use strict';

var expect = chai.expect;

describe('AvatarController>>', function () {
    var rootScope, scope, auth, timeout, doc;

    /*** SETUP ************************************************************************************/
    beforeEach(module('account'));
    beforeEach(module('account.avatar'));
    beforeEach(inject(function ($rootScope, $controller, $timeout, $document, Auth) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        auth = Auth;
        timeout = $timeout;
        doc = $document;

        $controller('AvatarCtrl', {
            $scope: scope,
            $rootScope: rootScope,
            $timeout: timeout,
            $document: doc,
            Auth: auth
        });

    }));
    /*** SETUP ************************************************************************************/

    /*** TESTS ************************************************************************************/
    it('should initialise vars', function () {

        expect(scope.picture).to.equal('');
		scope.errors.should.be.an('object');
		expect(scope.type).to.equal('');
        scope.currentUser.should.be.an('object');
        expect(scope.currentUser).to.equal(auth.getCurrentUser());
		scope.zoomObject.should.be.an('object');
		expect(scope.zoomObject.value).to.equal(50);
    });

 /*** TESTS ************************************************************************************/
});
