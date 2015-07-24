/*global chai, sinon, inject */
/*eslint no-unused-expressions:0 */
'use strict';

var expect = chai.expect;

describe('AdminCtrl', function () {
    var scope, state, adminService;

    /*** SETUP ************************************************************************************/
    beforeEach(module('shell.admin'));
    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        state = {
            go: function () {},
            current: { name: '' }
        };

        adminService = { items: [] };

        $controller('AdminCtrl', {
            $scope: scope,
            $state: state,
            AdminService: adminService
        });

    }));
    /*** SETUP ************************************************************************************/




    /*** TESTS ************************************************************************************/

    it('should initialise vars', function () {
        expect(scope.items.length).to.equal(adminService.items.length);
        adminService.items.push({ name: 'item1' });
        expect(scope.items.length).to.equal(adminService.items.length);
    });


    it('should listen to broadcast', function () {
        var stateSpy = sinon.spy(state, 'go');

        scope.$broadcast('$stateChangeStart', {}, { name: 'shell' });
        stateSpy.should.not.have.been.called;
        stateSpy.reset();

        adminService.items.push({ name: 'item1', state: 'item1' });
        scope.$broadcast('$stateChangeStart', { name: 'shell.admin' });
        stateSpy.should.have.been.calledWith('item1');
        stateSpy.reset();
    });

});
