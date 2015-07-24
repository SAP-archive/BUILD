/*global chai, sinon, inject */
/*eslint no-unused-expressions:0 */
'use strict';

var expect = chai.expect;

describe('AsideCtrl', function () {
    var rootScope, scope, state, asideService, mockedService, mockedNavBarService, mockedAuthService, mock_timeout;

    /*** SETUP ************************************************************************************/
    beforeEach(module('shell.aside'));
    beforeEach(inject(function ($rootScope, $controller, AsideFactory, $timeout) {
        mock_timeout = $timeout;
        scope = $rootScope.$new();
        rootScope = $rootScope;
        rootScope.currentProject = null;
        state = {
            go: function () {
            },
            current: {name: ''}
        };
        mockedService = {id: null, name: null};
        mockedNavBarService = {
            updateHeading: function () {
                return;
            },
            show: function () {
            }
        };
        mockedAuthService = {
            getSecurityConfig: function () {
                return {
                    then: function (d) {
                        d.settings = {application: {admin: false}};
                    }
                };
            }
        };
        asideService = AsideFactory;

        $controller('AsideCtrl', {
            $state: state,
            $rootScope: rootScope,
            $scope: scope,
            AsideService: asideService,
            ActiveProjectService: mockedService,
            globals: {id: null, name: null},
            NavBarService: mockedNavBarService,
            Auth: mockedAuthService
        });

    }));
    /*** SETUP ************************************************************************************/


    /*** TESTS ************************************************************************************/
    it('should change the state (stateGo)', function () {
        var stateSpy = sinon.spy(state, 'go');

        scope.stateGo('shell', {});
        stateSpy.should.have.been.calledWith('shell');
        stateSpy.reset();

        scope.stateGo('shell', {currentProject: 'Project1'});
        stateSpy.should.have.been.calledWith('shell');
        stateSpy.reset();
        var items = [
            {name: 'one', state: 'shell.one', isPersistant: true},
            {name: 'two', state: ['shell.two.one', 'shell.two.two'], isPersistant: true}
        ];
        asideService.push(items[0]);
        asideService.push(items[1]);
        scope.stateGo(['shell.one', 'shell.two'], {currentProject: 'Project1'});
        stateSpy.should.have.been.calledWith('shell.one');
        stateSpy.reset();
    });


    it('should verify that item is persistent', function () {
        var stateSpy = sinon.spy(state, 'go');
        var items = [
            {name: 'one', state: 'shell.one', isPersistant: true},
            {name: 'two', state: ['shell.two.one', 'shell.two.two'], isPersistant: true}
        ];
        rootScope.$broadcast('$stateChangeSuccess');
        scope.stateGo('shell', {});
        stateSpy.should.have.been.calledWith('shell');
        stateSpy.reset();

        asideService.push(items[0]);
        asideService.push(items[1]);

        scope.stateGo(items[0].state, {});
        stateSpy.should.have.been.calledWith(items[0].state);
        stateSpy.reset();

        scope.stateGo(items[1].state, {});
        stateSpy.should.have.been.calledWith(items[1].state[0]);
        stateSpy.reset();
    });


    it('should find active item (getAsideActiveItem)', function () {
        var items = [
            {name: 'one', state: 'shell.one', persistant: true},
            {name: 'two', state: ['shell.two.one', 'shell.two.two'], root: 'shell.two'},
            {name: 'three', state: 'shell.three', root: 'shell.other'}
        ];
        asideService.push(items[0]);
        asideService.push(items[1]);
        asideService.push(items[2]);

        state.current.name = 'shell.one';
        rootScope.$broadcast('$stateChangeSuccess', state.current);
        mock_timeout.flush();
        expect(scope.menuItemSelected).to.be.equal(items[0].name);

        state.current.name = 'shell.two.two';
        rootScope.$broadcast('$stateChangeSuccess', state.current);
        mock_timeout.flush();
        expect(scope.menuItemSelected).to.be.equal(items[1].name);

        state.current.name = 'shell.other';
        rootScope.$broadcast('$stateChangeSuccess', state.current);
        mock_timeout.flush();
        expect(scope.menuItemSelected).to.be.equal(items[2].name);

        state.current.name = 'other state';
        rootScope.$broadcast('$stateChangeSuccess', state.current);
        mock_timeout.flush();
        expect(scope.menuItemSelected).to.be.equal('');
    });

});
