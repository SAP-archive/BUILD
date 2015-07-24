'use strict';

/**
 * Directive that listens for up/down keypresses and invokes the callback function accordingly.
 * @param $parse
 * @returns {{restrict: string, link: Function}}
 */
// @ngInject
module.exports = function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {

            var keyPressed = function (event) {
                if (event.keyCode === 38 || event.keyCode === 40) {
                    if (event.keyCode === 38) {
                        $parse(attrs.arrowKeys)(scope, {action: 'previous'});
                    }
                    else if (event.keyCode === 40) {
                        $parse(attrs.arrowKeys)(scope, {action: 'next'});
                    }
                    var selectedSentiment = document.querySelectorAll('.sentiment-container.active');
                    if (selectedSentiment.length > 0) {
                        event.preventDefault();
                    }
                }
            };

            window.addEventListener('keydown', keyPressed);

            scope.$on('$destroy', function () {
                window.removeEventListener('keydown', keyPressed);
            });
        }
    };
};
