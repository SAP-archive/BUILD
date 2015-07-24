'use strict';

module.exports = angular.module('common.utils', [])
    .factory('uiUtil', require('./utils.js'))
    .factory('uiThumbnailGenerator', require('./thumbnail.generator.js'))
    .factory('uiFocusHelper', require('./focus.helper.js'))
    .factory('featureToggle', require('./feature.toggle.js'));
