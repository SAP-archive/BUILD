/**
 * @ngdoc directive
 * @name uiInputContainer
 * @module angular-sap-ui-elements:ui-elements:ui-input-container
 *
 * @restrict E
 *
 * @description
 * `<ui-input-container>` is the parent of any input or textarea element.
 *
 * Input and textarea elements will not behave properly unless the ui-input-container
 * parent is provided.
 *
 * @usage
 *
 * <ui-input-container>
 *   <label>Username</label>
 *   <input type="text" ng-model="user.name">
 * </ui-input-container>
 *
 * <ui-input-container>
 *   <label>Description</label>
 *   <textarea ng-model="user.description"></textarea>
 * </ui-input-container>
 *
 */
'use strict';

// @ngInject
module.exports = function () {
    return {
        restrict: 'E',
        controller: ['$scope', '$element', ContainerCtrl]
    };

    function ContainerCtrl(scope, element) {
        var self = this;

        self.element = element;
        self.setFocused = function (isFocused) {
            element.toggleClass('ui-input-focused', !!isFocused);
        };
        self.setHasValue = function (hasValue) {
            element.toggleClass('ui-input-has-value', !!hasValue);
        };
        self.setInvalid = function (isInvalid) {
            element.toggleClass('ui-input-invalid', !!isInvalid);
        };

        scope.$watch(function () {
            return self.label && self.input;
        }, function (hasLabelAndInput) {
            if (hasLabelAndInput && !self.label.attr('for')) {
                self.label.attr('for', self.input.attr('id'));
            }
        });
    }
};
