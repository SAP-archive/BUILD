'use strict';

(function () {

    var expect = chai.expect;

    describe('Directive: np-select-dropdown', function () {
        var elem, scope;

        beforeEach(module('uiComposer.directives'));
        beforeEach(module('templates'));

        beforeEach(function () {

            inject(function ($templateCache, $rootScope, $compile) {
                elem = angular.element('<np-select-dropdown list="data" ng-model="model"></np-select-dropdown>');
                scope = $rootScope.$new();
                scope.data = ['lineItem1', 'lineItem2'];
                scope.model = scope.data[0];
                elem = $compile(elem)(scope);
                scope.$digest();
            });
        });

        it('should set selected with initial ng-model value', function () {
            expect(elem.isolateScope().select.selected).to.be.equal('lineItem1');
            expect(elem.isolateScope().select.selected).to.not.be.undefined;
        });

        it('should toggle the selectbox on click', function () {
            elem.isolateScope().select.show = false;
            var child = elem.children('.np-s-selectbox-toggle');
            child.triggerHandler('click');
            expect(elem.isolateScope().select.show).to.be.equal(true);
            child.triggerHandler('click');
            expect(elem.isolateScope().select.show).to.be.equal(false);
        });

        it('should select item on click', function () {
            elem.isolateScope().select.show = true;
            var children = elem.find('a');
            angular.element(children[2]).triggerHandler('click');
            expect(elem.isolateScope().select.selected).to.be.equal('lineItem2');
        });


    });
})();
