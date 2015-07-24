'use strict';

/**
* @ngdoc directive
* @name ui.elements:uiToolbar
*
* @description
* Create a HTML container to display a toolbar
*
* @restrict E
* @element ANY
*
* @example

<doc:example>
  <doc:source>
      <ui-toolbar></ui-toolbar>
  </doc:source>
</doc:example>
*/

// @ngInject
module.exports = function () {

    return {
        restrict: 'E',
        controller: angular.noop,
        link: function () {}
    };

};
