/*eslint no-unused-expressions: 0*/
'use strict';

describe('Unit tests for PublishedCtrl', function () {
    var scope,
        state = { go: function () {} },
        stateSpy = sinon.spy(state, 'go'),
        currentStudy = {
            name: 'test',
            description: 'test description'
        };

    /*** SETUP ************************************************************************************/
    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));

    beforeEach(module('ngResource'));

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        $controller('PublishedCtrl', { $scope: scope, $state: state, currentStudy: currentStudy });
    }));
    afterEach(function () {
        stateSpy.reset();
    });

    /*** SETUP ************************************************************************************/



    /*** TESTS ************************************************************************************/
    it('should handle Done clicks', function () {
        scope.done();
        stateSpy.should.have.been.calledWith('shell.project.UserResearch.list');
    });


});
