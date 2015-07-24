'use strict';


// @ngInject
module.exports = function () {
    return {
        templateUrl: 'resources/norman-auth-client/settings/settings.html',
        restrict: 'E',
        replace: true,
        transclude: true,
        controller: require('./settings.controller'),
        link: function () {}
    };
};
