'use strict';

/**
* @ngdoc directive
* @name ui.elements:uiSidenav
*
* @description
* Create a HTML container to display the navigation side bar
*
* @restrict E
* @element ANY
*
* @example

<doc:example>
  <doc:source>
      <ui-sidenav></ui-sidenav>
  </doc:source>
</doc:example>
*/

// @ngInject
module.exports = function() {
    return {
        restrict: 'E',
        controller: ['$scope', '$element', SidenavController],
        link: function () {

        }
    };

    function SidenavController($scope, $element) {
        this.$scope = $scope;
        this.$element = $element;
    }
};
