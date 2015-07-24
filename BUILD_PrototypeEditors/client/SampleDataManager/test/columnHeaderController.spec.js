'use strict';

var expect = chai.expect;

describe('Controller: columnHeaderController', function() {
   var createController, scope, $httpBackend, $rootScope,
       uiErrorMock, uiDialogHelperMock;

   beforeEach(module('ui.router'));
   beforeEach(module('ngResource'));
   beforeEach(module('SampleDataManager'));

   var mockModelErrorInterceptor = {responseError :function(){}};

   beforeEach(module(function ($provide) {
       $provide.value('modelErrorInterceptor', mockModelErrorInterceptor);
   }));

   beforeEach(inject(function(_$rootScope_, $controller) {

       $rootScope = _$rootScope_;

       createController = function () {
           scope = $rootScope.$new();
           return $controller('columnHeaderController', {
               $scope: scope
           });
       };
   }));

   describe('initialization', function() {
       it('should show the sample data editor', function() {
           var ctrl = createController();
           expect(ctrl.columnHeaderControllerSafe).to.be.equal(true);
       });
   });
});
