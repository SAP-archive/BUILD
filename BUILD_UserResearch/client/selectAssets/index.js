'use strict';

angular.module('UserResearch')

    .factory('Assets', require('./service'))
    .controller('SelectAssetsCtrl', require('./controller.js'));
