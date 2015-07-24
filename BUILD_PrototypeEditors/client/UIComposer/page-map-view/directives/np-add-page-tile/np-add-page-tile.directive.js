'use strict';

module.exports = npAddPageTile;

npAddPageTile.$inject = [];

function npAddPageTile() {
    return {
        restrict: 'E',
        templateUrl: 'resources/norman-prototype-editors-client/UIComposer/page-map-view/directives/np-add-page-tile/np-add-page-tile.html',
        scope: {
            title: '@',
            iconClass: '@',
            description: '@',
            addFn: '&'
        }
    };
}
