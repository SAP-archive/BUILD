'use strict';
(function () {
    var expect = chai.expect;

    describe('Service: np-asset', function () {

        var npAsset, $httpBackend, state;
        var assetsResp = [{
            filename: 'image.png',
            _id: '123451'
        }, {
            filename: 'image1.png',
            _id: '123452'
        }];

        state = {
            params: {
                currentProject: 1111
            }
        };

        beforeEach(module('ngResource'));
        beforeEach(module('uiComposer.uiEditor.libraryPanel'));

        beforeEach(function () {

            module(function ($provide) {
                $provide.value('$state', state);
            });

            inject(function ($injector) {
                $httpBackend = $injector.get('$httpBackend');
                npAsset = $injector.get('npAsset');

                $httpBackend.whenGET('api/projects/document').respond(assetsResp);
            });
        });


        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should return the asset library when an asset is present', function () {
            var assetsLib = npAsset.getAssetsLibrary();
            var assets = [];
            assetsLib.then(function (assetLibrary) {
                assets = assetLibrary;

            });
            $httpBackend.flush();
            expect(assets.length).to.be.equal(2);
            expect(assets).to.be.an('array');

        });
    });
})();
