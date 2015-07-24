'use strict';

module.exports = ['$scope', '$q', 'npUiCatalog', 'npAsset', 'npBindingHelper', 'resCatalogs', 'resAssets',
    function ($scope, $q, npUiCatalog, npAsset, npBindingHelper, resCatalogs, resAssets) {
        var that = this;

        that.selectLibrary = function (technology) {
            that.library.technology = technology;
            var catalogId = that.library.technology.catalogId;
            that.library.catalog = npUiCatalog.getControlsByCatalogId(catalogId, that.library.floorplanFilter);
        };

        // get list of controls to be displayed on palette based on floorplan
        var getControlsForFloorplan = function (event, floorplan) {
            that.library.floorplanFilter = floorplan;
            that.selectLibrary(that.library.technology);
        };

        var initLibrary = function () {
            that.library = {};
            that.library.search = {};
            that.library.technology = {};
            that.library.technology.search = {};
            that.library.catalog = {};
            that.library.floorplanFilter = null;
            that.library.technologies = [];
            that.library.assetsOpen = true;
            // get all available technologies from catalog
            that.library.technologies = resCatalogs;
            that.selectLibrary(that.library.technologies[0]);

            that.library.assets = resAssets;
            that.library.assets.search = {};
        };
        initLibrary();

        that.resetSearch = function () {
            that.library.technology.search = {};
        };

        // TODO needed by ui-tabs control, might be able to remove that later
        that.tabOn = null;

        $scope.$on('bindinghelper-model-loaded', function () {
            that.allEntities = npBindingHelper.getEntitiesAndProperties();
        });

        that.getPaths = function () {
            return npBindingHelper.getGroupPaths();
        };

        var getAssetsFromProjectLibrary = function () {
            npAsset.getAssetsLibrary({
                projectId: $scope.uieditor.currentProject
            }).then(function (response) {
                that.library.assets = response;
            });
        };

        $scope.$on('executeLibraryRefresh', getAssetsFromProjectLibrary);
        $scope.$on('executeCatalogRefresh', getControlsForFloorplan);
    }
];
