'use strict';

/**
 * @ngdoc service
 * @param $rootScope
 * @description A factory used to populate the Shell Aside Menu
 * @returns {{get: Function, push: Function}}
 */
// @ngInject
module.exports = function ($timeout) {
    // TODO: incorporate user preferences at a later date
    var that = this;
    that.menuItems = [];
    that.hidden = false;
    that.hideWithAnimation = false;
    that.showWithAnimation = false;

    function mergeMenuItem(menuItem, newMenuItem) {
        if (!Array.isArray(menuItem.state)) {
            var states = [menuItem.state, newMenuItem.state];
            menuItem.state = states;
        }
        else {
            menuItem.state.push(newMenuItem.state);
        }
    }

    /**
     * @description validate if JSON object already exists in list
     * @param menuItem
     * @returns {boolean} true | false
     */
    function isItemNew(menuItem) {
        var addToList = true,
            itemName = menuItem.name.toLowerCase();

        that.menuItems.forEach(function (item) {
            if (item.name.toLowerCase() === itemName) {
                mergeMenuItem(item, menuItem);
                addToList = false;
            }
        });
        return addToList;
    }

    that.updateBadge = function (menuItem, value) {
        if (value !== '') {
            angular.forEach(that.menuItems, function (elt) {
                if (elt.name === menuItem) {
                    elt.badge = value;
                }
            });
        }
    };

    that.push = function (menuItem) {
        if (isItemNew(menuItem)) {
            that.menuItems.push(menuItem);
            that.menuItems.sort(function (a, b) {
                return a.priority - b.priority;
            });
        }
    };
    that.pop = function (menuItemName) {
        that.menuItems.forEach(function (item) {
            if (item.name.toLowerCase() === menuItemName.toLowerCase()) {
                that.menuItems.pop(item);
            }
        });
    };
    that.hide = function () {
        that.hidden = true;
    };
    that.show = function () {
        that.hidden = false;
    };
    that.showAnimate = function () {
        that.showWithAnimation = true;
        that.hidden = false;
        $timeout(function () {
            that.showWithAnimation = false;
        }, 500);
    };
    that.hideAnimate = function () {
        that.hideWithAnimation = true;
        $timeout(function () {
            that.hidden = true;
            that.hideWithAnimation = false;
        }, 500);
    };
};
