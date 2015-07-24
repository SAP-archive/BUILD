/**
* @ngdoc directive
* @name ui.elements:uiContent
*
* @description
* Create a HTML container to display a HTML content
*
* @restrict E
* @element ANY
*
* @example

<doc:example>
  <doc:source>
      <ui-content></ui-content>
  </doc:source>
</doc:example>
*/
'use strict';

// @ngInject
module.exports = function(uiUtil) {
  return {
    restrict: 'E',
    controller: ['$scope', '$element', ContentController],
    link: function($scope, $element) {
      $scope.$broadcast('$uiContentLoaded', $element);

      // TODO: Will need to debounce that call
      $element.bind('scroll', function() {
        $scope.$broadcast('$uiContentScrolled', $element);
        $scope.$apply();
      });

    }
  };

  function ContentController($scope, $element) {
    this.$scope = $scope;
    this.$element = $element;
  }
};
