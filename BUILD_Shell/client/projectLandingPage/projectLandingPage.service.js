'use strict';
/**
 * @ngdoc service
 * @param $rootScope
 * @description A factory used to populate the Home Dashboard
 * @returns {{get: Function, push: Function}}
 */
// @ngInject
module.exports = function () {
    var that = this;
    that.widgets = [];

    that.push = function (widget) {
        that.widgets.push(widget);
        that.widgets.sort(function (a, b) {
            return a.priority - b.priority;
        });
    };

};
