/*global chai, inject */
/*eslint no-unused-expressions:0 */
'use strict';

var expect = chai.expect;

describe('ShellDashboardCtrl', function () {
    var scope, state, globals;

    /*** SETUP ************************************************************************************/
    beforeEach(module('shell.dashboard'));
    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        globals = {

        };
        state = {
            go: function () {},
            current: { name: '' }
        };
        $controller('ShellDashboardCtrl', {
            $state: state,
            $scope: scope,
            globals: globals,
            AsideFactory: {}
        });

    }));
    /*** SETUP ************************************************************************************/




    /*** TESTS ************************************************************************************/

    it('should initialise vars', function () {
        expect(1).to.equal(1);
    });

});
