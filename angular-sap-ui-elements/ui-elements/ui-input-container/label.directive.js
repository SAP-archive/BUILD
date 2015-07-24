'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:ui-input-container:label
 *
 * @description
 * Creates a HTML label element with relevant styling applied.
 *
 * @restrict E
 * @element ANY
 *
 * @param {} dark if present, the rendered element will be applied with a dark styling theme.
 *
 * @example

 <doc:example>
 <doc:source>
 <label>
 </doc:source>
 </doc:example>
 *
*/

// @ngInject
module.exports = function () {
  return {
    restrict: 'E',
    require: '^?uiInputContainer',
    link: function(scope, element, attr, containerCtrl) {
      if (!containerCtrl) return;

      containerCtrl.label = element;
      scope.$on('$destroy', function() {
        containerCtrl.label = null;
      });
    }
  };
};
