'use strict';
(function () {

    var expect = chai.expect;

    describe('Directive: np-prevent-context-menu', function () {
        var elem, scope;

        beforeEach(function () {

            module('uiComposer.directives');

            inject(function ($rootScope, $compile) {
                elem = angular.element('<div np-prevent-context-menu></div>');
                scope = $rootScope.$new();
                elem = $compile(elem)(scope);
                scope.$digest();
            });
        });

        it('should prevent the context menu from showing up', function () {
            var evt = document.createEvent('MouseEvent');
            evt.initMouseEvent('contextmenu', true, true);
            var spy = sinon.spy(evt, 'preventDefault');
            elem[0].dispatchEvent(evt);
            expect(spy.called).to.be.ok;
        });
    });
})();
