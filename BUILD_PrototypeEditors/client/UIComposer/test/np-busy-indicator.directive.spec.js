'use strict';
(function () {

    var expect = chai.expect;

    describe('Directive: np-busy-indicator', function () {
        var elem, scope, $compile;

        var testShowBusyIndicator = function (testValue) {
            elem.attr('show-busy-indicator', testValue);
            elem = $compile(elem)(scope);
            scope.$digest();

            // TODO: I haven't found a way to check visibility or computed css display property, so I'm just checking attribute value for now
            expect(elem.attr('show-busy-indicator')).to.be.equal(testValue);
        };

        beforeEach(module('uiComposer.uiCanvas'));
        beforeEach(module('uiComposer.uiEditor'));

        beforeEach(function () {
            inject(function ($rootScope, _$compile_) {
                $compile = _$compile_;
                elem = angular.element('<np-busy-indicator></np-busy-indicator>');
                scope = $rootScope.$new();
                elem = $compile(elem)(scope);
                scope.$digest();
            });
        });

        it('Test show-busy-indicator true', function () {
            testShowBusyIndicator('true');
        });

        it('Test show-busy-indicator false', function () {
            testShowBusyIndicator('false');
        });
    });
})();
