'use strict';

// @ngInject
module.exports = function($timeout, $animate) {
  return {
    restrict: 'EA',
    require: '^uiAccordion',
    transclude: true,
    replace: true,
    template: '<div ng-transclude></div>',
    scope: {
      isExpanded: '=?expanded'
    },
    controllerAs: 'uiAccordionPaneCtrl',
    controller: ['$scope', uiAccordionPaneDirectiveController],
    compile: function(element, attrs) {

      element.addClass('ui-accordion-pane');

      return function postLink(scope, element, attrs, uiAccordionCtrl) {
        if (!angular.isDefined(scope.isExpanded)) {
          scope.isExpanded = angular.isDefined(attrs.expanded);
        }

        var paneHeaderNative = element[0].querySelector('.ui-accordion-paneHeader'),
            paneContentNative = element[0].querySelector('.ui-accordion-paneContent');

        if (!paneHeaderNative) {
          throw new Error('The `ui-accordion-pane-header` directive can\'t be found');
        }

        if (!paneContentNative) {
          throw new Error('The `ui-accordion-pane-content` directive can\'t be found');
        }

        var paneInnerNative = paneContentNative.querySelector('div');

        var paneHeaderElement = angular.element(paneHeaderNative),
            paneContentElement = angular.element(paneContentNative);

        var expandedStateClass = 'is-expanded';
        var expandedEndedStateClass = 'is-expanded-ended';

        uiAccordionCtrl.addPane(scope);
        scope.uiAccordionCtrl = uiAccordionCtrl;

        paneContentNative.style.maxHeight = '0px';

        function expand() {
          uiAccordionCtrl.disable();

          var paneInnerHeight = paneInnerNative.offsetHeight;
          paneContentNative.style.maxHeight = '0px';

          $timeout(function() {
            $animate.addClass(paneContentElement, expandedStateClass)
                .then(function() {
                  paneContentElement.addClass(expandedEndedStateClass);
                  uiAccordionCtrl.enable();
                  paneContentNative.style.maxHeight = 'none';
                });

            setTimeout(function() {
              paneContentNative.style.maxHeight = paneInnerHeight + 'px';
            }, 0);
          }, 0);

          element.addClass(expandedStateClass);

          paneHeaderElement.addClass(expandedStateClass);

        }

        function collapse() {
          uiAccordionCtrl.disable();

          var paneInnerHeight = paneInnerNative.offsetHeight;

          paneContentNative.style.maxHeight = paneInnerHeight + 'px';

          $timeout(function() {
            paneContentElement.removeClass(expandedEndedStateClass);
            $animate.removeClass(paneContentElement, expandedStateClass)
                .then(function() {
                  uiAccordionCtrl.enable();
                });

            setTimeout(function() {
              paneContentNative.style.maxHeight = '0px';
            }, 0);
          }, 0);

          element.removeClass(expandedEndedStateClass);
          element.removeClass(expandedStateClass);

          paneHeaderElement.removeClass(expandedEndedStateClass);
          paneHeaderElement.removeClass(expandedStateClass);
        }

        $timeout(function() {
          if (scope.isExpanded) {
            expand();
          }
        }, 100);

        scope.$watch('isExpanded', function(newValue, oldValue) {
          if (newValue === oldValue) {
            return true;
          }
          if (newValue) {
            expand();
          } else {
            collapse();
          }
        });

      };
    }
  };

  // uiAccordionPane directive controller
  function uiAccordionPaneDirectiveController($scope) {
    var ctrl = this;

    ctrl.toggle = function() {
      if (!$scope.isAnimating) {
        $scope.uiAccordionCtrl.toggle($scope);
      }
    };
  }
};