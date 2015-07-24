'use strict';
(function () {

    var expect = chai.expect;

    describe('Directive: np-ui-canvas-runtime', function () {
        var elem, scope, $q,
            npUiCanvasAPIMock, npPrototypeMock;

        beforeEach(module('uiComposer.uiCanvas'));

        beforeEach(function () {
            npUiCanvasAPIMock = {
                init: function (w) {
                    return $q.when(w);
                }
            };

            npPrototypeMock = {
                getPrototype: function () {
                    return $q.when({uiLang: 'UI5'});
                }
            };

            module(function ($provide) {
                $provide.value('npUiCanvasAPI', npUiCanvasAPIMock);
                $provide.value('npPrototype', npPrototypeMock);
            });

            inject(function ($rootScope, $compile, _$q_) {
                $q = _$q_;
                elem = angular.element('<div np-ui-canvas-runtime></div>');
                scope = $rootScope.$new();
                elem = $compile(elem)(scope);
                scope.$digest();
            });
        });

        it('should initialize the canvasAPI once the iframe loads', function () {
            var spy = sinon.spy(npUiCanvasAPIMock, 'init'),
                contentWindow = {};
            elem[0].contentWindow = contentWindow;
            elem.triggerHandler('load');
            scope.$apply();
            expect(spy.called).to.be.ok;
            var firstCallArgs = spy.args[0];
            expect(firstCallArgs[0]).to.be.equal(contentWindow);
            expect(firstCallArgs[1]).to.be.equal('UI5');
        });
    });
})();
