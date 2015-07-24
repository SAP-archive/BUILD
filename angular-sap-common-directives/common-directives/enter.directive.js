/**
 * Common directive for enter-key press found at http://stackoverflow.com/questions/17470790/how-to-use-a-keypress-event-in-angularjs
 */
'use strict';

// @ngInject
module.exports = function () {

    return function(scope, element, attrs){
        element.bind('keydown keypress', function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.nnEnter);
                });

                event.preventDefault();
            }
        });
    };
};
