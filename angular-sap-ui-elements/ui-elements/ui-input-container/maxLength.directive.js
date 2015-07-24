'use strict';

// @ngInject
module.exports = function ($animate) {
  return {
    restrict: 'A',
    require: ['ngModel', '^uiInputContainer'],
    link: postLink
  };

  function postLink(scope, element, attr, ctrls) {
    var maxlength;
    var ngModelCtrl = ctrls[0];
    var containerCtrl = ctrls[1];
    var charCountEl = angular.element('<div class="ui-char-counter">');

    // Stop model from trimming. This makes it so whitespace
    // over the maxlength still counts as invalid.
    attr.$set('ngTrim', 'false');
    containerCtrl.element.append(charCountEl);

    ngModelCtrl.$formatters.push(renderCharCount);
    ngModelCtrl.$viewChangeListeners.push(renderCharCount);
    element.on('input keydown', function() {
      renderCharCount(); //make sure it's called with no args
    });

    scope.$watch(attr.uiMaxlength, function(value) {
      maxlength = value;
      if (angular.isNumber(value) && value > 0) {
        if (!charCountEl.parent().length) {
          $animate.enter(charCountEl, containerCtrl.element, angular.element(containerCtrl.element[0].lastElementChild));
        }
        renderCharCount();
      } else {
        $animate.leave(charCountEl);
      }
    });

    ngModelCtrl.$validators['ui-maxlength'] = function(modelValue, viewValue) {
      if (!angular.isNumber(maxlength) || maxlength < 0) {
        return true;
      }
      return ( modelValue || element.val() || viewValue || '' ).length <= maxlength;
    };

    function renderCharCount(value) {
      var tLenght = ( element.val() || value || '' ).length;
      if (tLenght < maxlength / 2) {
        charCountEl.text('');
      } else {
        charCountEl.text(maxlength - tLenght);
      }
      if (tLenght > (maxlength - (maxlength * 0.1))) {
        charCountEl.addClass('red');
      } else {
        charCountEl.removeClass('red');
      }
      //charCountEl.text( tLenght + '/' + maxlength );
      return value;
    }
  }
};
