/*
'use strict';

// Require dependencies after angular and before all the aother modules
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

require('angular-file-upload');
require('angular-cookies');
require('angular-resource');
require('angular-sanitize');
require('angular-ui-router');

// Require optional modules

angular.module('norman', modules)
    .config(function ($urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/norman/UICatalogManager');
        $locationProvider.html5Mode(true);
    })
    .constant('jQuery', require('norman-jquery'));
*/

var modules = require('norman-client-tp').modules;
require('./requires.js');


angular.module('norman', modules)
    .config(function ($urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/norman/UICatalogManager');
        $locationProvider.html5Mode(true);
    })
    .constant('jQuery', require('norman-client-tp').jquery);
