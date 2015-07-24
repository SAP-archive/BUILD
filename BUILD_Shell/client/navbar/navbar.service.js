'use strict';
/**
 * @ngdoc service
 * @description A factory used to populate the Shell Navigation Menu bar
 * @param $rootScope
 * @returns {{get: Function, push: Function}}
 */
// @ngInject
module.exports = function () {
    var defaultHeading = '';
    var that = this;
    that.hidden = false;
    that.animate = false;
    that.isHero = false;
    that.heroProjectFromHome = false;
    that.heroProjectFromOther = false;
    that.heading = defaultHeading;
    that.menuItems = [];

    /**
     * Hide the navbar with no animation
     */
    that.hide = function () {
        that.animate = false;
        that.hidden = true;
        that.isHero = false;
        that.heroProjectFromHome = that.heroProjectFromOther = false;
    };
    /**
     * Show the navbar with no animation
     */
    that.show = function () {
        that.animate = false;
        that.hidden = false;
        that.isHero = false;
        that.heroProjectFromHome = that.heroProjectFromOther = false;
    };
    /**
     * Show the navbar with animation
     */
    that.showAnimate = function () {
        that.animate = true;
        that.hidden = false;
        that.isHero = false;
        that.heroProjectFromHome = that.heroProjectFromOther = false;
    };
    /**
     * Hide the navbar with animation
     */
    that.hideAnimate = function () {
        that.animate = true;
        that.hidden = true;
        that.isHero = false;
        that.heroProjectFromHome = that.heroProjectFromOther = false;
    };
    /**
     * Show the hero banner
     * @param toProject indicates that we go to the project page
     * @param fromHome indicates that we are coming from the home page
     */
    that.hero = function (toProject, fromHome) {
        that.animate = false;
        that.hidden = false;
        that.isHero = true;
        if (toProject) {
            that.heroProjectFromHome = fromHome;
            that.heroProjectFromOther = !fromHome;
        }
        else {
            that.heroProjectFromHome = that.heroProjectFromOther = false;
        }
    };

    that.push = function (item) {
        that.menuItems.push(item);
    };

    that.setLogoState = function (url, stateParams) {
        that.logoState = url;
        if (stateParams !== null && stateParams !== undefined && typeof stateParams === 'object') {
            that.logoStateParams = stateParams;
        }
        else {
            that.logoStateParams = {};
        }
    };

    that.getLogoState = function () {
        return {
            logoState: that.logoState,
            logoStateParams: that.logoStateParams
        };
    };

    that.updateHeading = function (str) {
        if ((typeof str) === 'string') {
            that.heading = str;
        }
        else if (str === undefined || null) {
            that.heading = defaultHeading;
        }
        else throw new Error('Cannot set Heading as a non String');
    };

    that.updateSaveMessage = function (message) {
        that.saveMessage = message;
    };
};
