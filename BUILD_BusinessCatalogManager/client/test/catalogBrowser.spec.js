/*eslint global-strict:0 */
'use strict';

describe('Module: Catalogbrowser', function () {
    var expect = chai.expect;

    beforeEach(module('norman'));
    beforeEach(module('catalog'));

    var scope, catalogService, httpBackend;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        $controller('CatalogbrowserCtrl', {
            $scope: scope
        });
    }));

    beforeEach(inject(['bcm.Catalog', '$httpBackend', function (catalog, $httpBackend) {
        catalogService = catalog;
        httpBackend = $httpBackend;
    }]));

    it('should ...', function () {
        httpBackend.when('GET', '/api/catalogs').respond([{name: 'jlec'}]);

        catalogService.getCatalogs();

        expect(1).to.equal(1);
    });
});
