/*eslint no-unused-expressions: 0*/
'use strict';

describe('Unit tests for SelectAssetsCtrl', function () {
    var scope, controller,
        state = {
            go: function () {
            }
        },
        stateSpy = sinon.spy(state, 'go'),
        assetsService = {
            query: function () {
                return {
                    $promise: {
                        then: function (cb) {
                            cb([]);
                        }
                    }
                };
            }
        },
        initController = function (usePromise) {
            scope.study = {questions: []};
            if (usePromise) {
                scope.study.$promise = {
                    then: function (cb) {
                        cb({});
                    }
                };
            }
            controller('SelectAssetsCtrl', {
                $scope: scope,
                $state: state,
                $stateParams: {currentProject: 1},
                Assets: assetsService
            });
        };

    /*** SETUP ************************************************************************************/
    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));
    beforeEach(module('UserResearch.utils'));
    beforeEach(module('ngResource'));

    beforeEach(inject(function ($injector, $rootScope, $controller) {
        scope = $rootScope.$new();
        controller = $controller;
        initController();
        scope.loadAssets();
    }));

    afterEach(function () {
        stateSpy.reset();
    });
    /*** SETUP ************************************************************************************/

    /*** TESTS ************************************************************************************/
    it('should initialise', function () {
        expect(scope.projectId).to.be.equal(1);
        expect(scope.assets).to.be.instanceOf(Array);
    });

    it('should select and unselect assets', function () {
        scope.assets = [
            {metadata: {parent_id: 'url1'}, selected: false},
            {metadata: {parent_id: 'url2'}, selected: false},
            {metadata: {parent_id: 'url4'}, selected: true}
        ];

        expect(scope.assets[0].selected).to.equal(false);
        scope.selected = [];
        scope.selectAsset(0);
        expect(scope.selected.length).to.equal(1);
        expect(scope.selected[0].selected).to.equal(true);
        expect(scope.assets[0].selected).to.equal(true);

        scope.selected = [];
        scope.selectAsset(1);
        expect(scope.selected.length).to.equal(1);
    });

    it('should call addSelectedAssets on create', function () {
        scope.assets = [
            {metadata: {_id: 'url1'}},
            {metadata: {_id: 'url2'}},
            {metadata: {_id: 'url4'}}
        ];
        scope.selected = [scope.assets[1]];
        scope.addQuestions = function () {
        };
        var spy = sinon.spy(scope, 'addQuestions');
        scope.create();
        spy.should.have.been.called;
    });
});
