/**
 * @ngdoc directive
 * @name input
 * @restrict E
 * @module angular-sap-ui-elements:ui-elements:ui-input-container:input¡€¡qq10es
 *
 * @description
 * Must be placed as a child of an `<ui-input-container>`.
 *
 * Behaves like the [AngularJS input directive](https://docs.angularjs.org/api/ng/directive/input).
 *
 * @usage
 * <hljs lang="html">
 * <ui-input-container>
 *   <label>Color</label>
 *   <input type="text" ng-model="color" required ui-maxlength="10">
 * </ui-input-container>
 * </hljs>
 * <h3>With Errors (uses [ngMessages](https://docs.angularjs.org/api/ngMessages))</h3>
 * <hljs lang="html">
 * <form name="userForm">
 *   <ui-input-container>
 *     <label>Last Name</label>
 *     <input name="lastName" ng-model="lastName" required ui-maxlength="10" minlength="4">
 *     <div ng-messages="userForm.lastName.$error" ng-show="userForm.bio.$dirty">
 *       <div ng-message="required">This is required!</div>
 *       <div ng-message="ui-maxlength">That's too long!</div>
 *       <div ng-message="minlength">That's too short!</div>
 *     </div>
 *   </ui-input-container>
 * </form>
 * </hljs>
 *
 * @param {number=} ui-maxlength The maximum number of characters allowed in this input. If this is specified, a character counter will be shown underneath the input.
 */
'use strict';

// @ngInject
module.exports = function (uiUtil) {
    return {
        restrict: 'E',
        require: ['^?uiInputContainer', '?ngModel'],
        link: postLink
    };

    function postLink(scope, element, attr, ctrls) {

        var containerCtrl = ctrls[0];
        var isReadonly = angular.isDefined(attr.readonly);

        if (!containerCtrl) return;
        containerCtrl.input = element;

        element.addClass('ui-input');
        if (!element.attr('id')) {
            element.attr('id', 'input_' + uiUtil.nextUid());
        }

        function inputCheckValue() {
            containerCtrl.setHasValue(element.val().length > 0 || (element[0].validity || {}).badInput);
        }

        element.on('input', inputCheckValue);

        if (!isReadonly) {
            element
                .on('focus', function () {
                    containerCtrl.setFocused(true);
                })
                .on('blur', function () {
                    containerCtrl.setFocused(false);
                    inputCheckValue();
                });
        }

        scope.$on('$destroy', function () {
            containerCtrl.setFocused(false);
            containerCtrl.setHasValue(false);
            containerCtrl.input = null;
        });

    }
};
