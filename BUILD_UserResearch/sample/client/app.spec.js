/*eslint no-unused-expressions: 0*/
'use strict';

describe('Unit tests for PublishedCtrl', function () {
    var rootScope, state;


    /*** SETUP ************************************************************************************/
    beforeEach(module('norman'));

    beforeEach(inject(function ($rootScope, $state) {
        rootScope = $rootScope;
        state = $state;
    }));
    /*** SETUP ************************************************************************************/




    /*** TESTS ************************************************************************************/
    it('should set pageClass based on state', function () {
        var stateName = 'shell.project.UserResearch.list';
        state.go(stateName);
        expect(rootScope.pageClass).to.be.equal('page-' + stateName.replace(/\./g, '-'));
    });


});
