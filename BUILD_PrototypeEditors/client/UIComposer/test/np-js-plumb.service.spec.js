'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-js-plumb', function () {

        var npJsPlumb, $httpBackend;

        beforeEach(module('ngResource'));
        beforeEach(module('pageMapView'));

        beforeEach(function () {
            inject(function ($injector) {
                $httpBackend = $injector.get('$httpBackend');
                npJsPlumb = $injector.get('npJsPlumb');
                var html = '<div id="np-p-container"><div id="S0" style="height: 10px; width:20px; top:20px; left:10px;"></div> ' +
                    '<div id="S1" style="height: 10px; width:20px; top:40px; left:40px;"></div> <div id="S2"></div></div>';
                angular.element(document.body).append(html);
            });
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
            var pageMapContainer = document.getElementById('np-p-container');
            pageMapContainer.parentNode.removeChild(pageMapContainer);
        });

        it('should have the jsPlumb instance', function () {
            npJsPlumb.init();
            expect(npJsPlumb.instance).to.be.an('object');
        });

        it('should return the created connection', function () {
            npJsPlumb.init();
            npJsPlumb.instance.connect({
                source: 'S0',
                target: 'S1',
                name: 'S0S1Connector'
            });
            npJsPlumb.instance.connect({
                source: 'S1',
                target: 'S2',
                name: 'S1S2Connector'
            });
            var connection = npJsPlumb.getConnection('S0', 'S1', 'S0S1Connector');
            npJsPlumb.reset();
            expect(connection).to.be.an('array');
            expect(connection.length).to.be.equal(1);
        });
    });
})();
