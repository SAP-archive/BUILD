'use strict';

// @ngInject
module.exports = function () {

    /**
     * The tracking directive is added to buttons which control how the user is interacting with the system
     * 1. The directive is only fired when certain buttons are clicked i.e. return to study page | DONE
     * 2. The request will set the UPDATED_AT on the server which will track how long a user has spent on the question/task
     */

    return function (scope, element) {

        function fireTracking() {
            // Close PageView
            scope.resetPageViewTracking();

            // Close Navigation Tracking
            scope.resetNavigationTracking();
        }

        // Listening to certain button clicks inside the ui-view i.e. return to study and DONE
        var el = element[0];

        // Add event listener
        el.addEventListener('click', function () {
            fireTracking();
        });
    };
};
