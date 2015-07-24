'use strict';

function sidePanelService($rootScope) {

    var _displayed = true;

    this.EVENTS = {
        SIDE_PANEL_SHOWN: 'SidePanel.shown',
        SIDE_PANEL_HIDDEN: 'SidePanel.hidden'
    };

    this.toggleDisplay = function () {
        _displayed = !_displayed;
        if (_displayed) {
            $rootScope.$broadcast(this.EVENTS.SIDE_PANEL_SHOWN);
        }
        else {
            $rootScope.$broadcast(this.EVENTS.SIDE_PANEL_HIDDEN);
        }
    };

    this.isDisplayed = function () {
        return _displayed;
    };
}

module.exports = ['$rootScope', sidePanelService];
