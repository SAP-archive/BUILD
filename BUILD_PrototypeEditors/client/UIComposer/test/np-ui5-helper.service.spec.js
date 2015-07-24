'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-ui5-helper', function () {
        var npUi5Helper, npAbsoluteLayoutHelperMock, npLayoutHelperMock;

        beforeEach(function () {
            npLayoutHelperMock = {
                setCurrentLayout: function (t) {
                    this.t = t;
                },
                getCurrentLayout: function () {
                    return this.t;
                },
                isAbsoluteLayout: function () {
                    return this.t === 'ABSOLUTE';
                }
            };

            npAbsoluteLayoutHelperMock = {
                init: sinon.stub()
            };

            module('uiComposer.technologyHelpers');

            module(function ($provide) {
                $provide.value('npAbsoluteLayoutHelper', npAbsoluteLayoutHelperMock);
                $provide.value('npLayoutHelper', npLayoutHelperMock);
            });

            inject(function ($injector) {
                npUi5Helper = $injector.get('npUi5Helper');
            });
        });

        describe('initialization', function () {
            it('init wait for canvas to be rendered', function () {
                var setWindowPromise = npUi5Helper.setWindow();
                expect(setWindowPromise).to.be.rejected;
            });
        });
    });
})();
