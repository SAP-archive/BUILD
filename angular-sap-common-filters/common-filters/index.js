'use strict';

module.exports = angular.module('common.filters', [])
    .filter('fileSize', require('./filesize.js'))
    .filter('fileType', require('./filetype.js'));
