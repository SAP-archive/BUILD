'use strict';

// Require dependencies after angular and before all the aother modules
require('jquery');
require('angular');

var aModule = angular.module, modules = [], dependencies = [];
angular.module = function (name, dep) {
    if (dep) {
        if (name !== 'norman' && dependencies.indexOf(name) === -1) {
            modules.push(name);
        }
        dependencies = dependencies.concat(dep);
    }
    return aModule(name, dep);
};

require('angular-bootstrap');
require('angular-cookies');
require('angular-resource');
require('angular-sanitize');
require('angular-socket-io');
require('angular-ui-router');

// Require optional modules
require('./requires.js');

angular.module('norman', modules)
    .config(function ($urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
    });

