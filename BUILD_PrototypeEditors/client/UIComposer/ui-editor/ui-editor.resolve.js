'use strict';

module.exports = {
    resCatalogs: ['npUiCatalog', function (npUiCatalog) {
        return npUiCatalog.getCatalogs();
    }],
    resAssets: ['$stateParams', 'npAsset', function ($stateParams, npAsset) {
        return npAsset.getAssetsLibrary({
            projectId: $stateParams.currentProject
        });
    }],
    resPageMd: ['$stateParams', 'npPageMetadata', function ($stateParams, npPageMetadata) {
        return npPageMetadata.getPageMetadata($stateParams.currentScreen);
    }],
    resPrototype: ['npPrototype', function (npPrototype) {
        return npPrototype.getPrototype();
    }]
};
