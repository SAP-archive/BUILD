'use strict';

var expect = chai.expect;

describe('Controller: sidePanel relations', function() {
    var createController, scope, $httpBackend, $rootScope;

    beforeEach(module('norman'));
    beforeEach(module('model'));
    var mockModelErrorInterceptor = {responseError :function(){}};
    beforeEach(module(function ($provide) {
        $provide.value('modelErrorInterceptor', mockModelErrorInterceptor);
    }));

    beforeEach(inject(function(_$rootScope_, $controller) {
        $rootScope = _$rootScope_;

        createController = function() {
            scope = $rootScope.$new();
            return $controller('RelationsController', {
                $scope: scope
            });
        };
    }));

    describe('initialization', function() {
        it('should show the side panels by default', function() {
            var ctrl = createController();
        });
    });
});
