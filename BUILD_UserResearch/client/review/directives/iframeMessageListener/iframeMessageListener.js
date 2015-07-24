'use strict';
/**
 * This is a directive which allows us to listen for a message broadcast
 * and to call a supplied function. It also listens for a broadcast which
 * triggers a postMessage to the iframe of the supplied ID with the message supplied
 *
 * @param $window
 * @param $timeout
 * @returns {{restrict: string, scope: {messageReceived: string}, link: Function}}
 */
// @ngInject
module.exports = function ($window, $timeout) {
    return {
        restrict: 'E',
        scope: {
            messageReceived: '&'
        },
        link: function (scope) {
            // This allow us to post messages from an iframe and trigger a function in the parent's window
            var messageEventListener = function (event) {
                if (typeof scope.messageReceived === 'function') {
                    scope.messageReceived({event: event});
                }
            };
            // This adds a listener to the window for a 'message' event.
            angular.element($window).on('message', messageEventListener);
            // clean up on $destroy
            scope.$on('$destroy', function () {
                angular.element($window).off('message', messageEventListener);
            });
            // triggered when broadcasted to 'send-iframe-message'
            // requires a json object in the form { iframeId : 'someId', iframeMessage: 'some message'}
            scope.$on('send-iframe-message', function (event, data) {
                $timeout(function () {
                    document.getElementById(data.iframeId).contentWindow.postMessage(data.iframeMessage, '*');
                });
            });
        }
    };
};
