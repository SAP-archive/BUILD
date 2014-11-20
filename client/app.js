'use strict';

// Require dependencies after angular and before all the aother modules
require('jquery');
require('angular');

var aModule = angular.module, modules = [], dependencies = [];
angular.module = function (name, dep) {
    if (dep) {
        if (dependencies.indexOf(name) === -1) {
            modules.push(name);
        }
        dependencies = dependencies.concat(dep);
    }
    return aModule(name, dep);
};


// "require" all client-side modules from the client package.json
// var dependencies = require('./package.json').dependencies, dep;
// for (dep in dependencies) {
//     require(dep);
// }

require('angular');
require('angular-bootstrap');
require('angular-cookies');
require('angular-resource');
require('angular-sanitize');
require('angular-socket-io');
require('angular-ui-router');
require('jquery');


// Require client-side norman modules here:
// require('../node_modules/norman-shell-client');


angular.module('normanGeneratorTestsApp', modules)
    .config(function ($urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
    });
