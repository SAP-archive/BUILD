'use strict';

// @ngInject
module.exports = function () {
    var messages = [],
            messageStack = [];

    var defaults = {
        className: 'error',
        dismissOnTimeout: true,
        timeout: 10000,
        dismissButton: true,
        dismissButtonHtml: '&times;',
        dismissOnClick: true,
        compileContent: false,
        horizontalPosition: 'center', // right, center, left
        verticalPosition: 'top', // top, bottom,
        maxNumber: 0
    };

    function Message(msg) {
        var id = Math.floor(Math.random() * 1000);
        while (messages.indexOf(id) > -1) {
            id = Math.floor(Math.random() * 1000);
        }

        this.id = id;
        this.className = defaults.className;
        this.dismissOnTimeout = defaults.dismissOnTimeout;
        this.timeout = defaults.timeout;
        this.dismissButton = defaults.dismissButton;
        this.dismissButtonHtml = defaults.dismissButtonHtml;
        this.dismissOnClick = defaults.dismissOnClick;
        this.compileContent = defaults.compileContent;

        angular.extend(this, msg);
    }

    this.configure = function (config) {
        angular.extend(defaults, config);
    };

    this.$get = ['$rootScope', function ($rootScope) {
        return {
            settings: defaults,
            messages: messages,
            dismiss: function (id) {
                if (id) {
                    for (var i = messages.length - 1; i >= 0; i--) {
                        if (messages[i].id === id) {
                            messages.splice(i, 1);
                            messageStack.splice(messageStack.indexOf(id), 1);
                            return;
                        }
                    }
                }
                else {
                    while (messages.length > 0) {
                        messages.pop();
                    }
                    messageStack = [];
                }
            },
            create: function (msg) {

                if (defaults.maxNumber > 0 && messageStack.length >= defaults.maxNumber) {
                    this.dismiss(messageStack[0]);
                }

                // default error message for when none have been passed
                if (!msg) {
                    msg.content = '"An error occurred.<br> Please fix that issue and if this error persists contact support.';
                } else {
                    if (typeof msg === 'object') {
                        if (typeof msg.content === 'undefined') {
                            msg.content = 'An error occurred.<br> Please fix that issue and if this error persists contact support.';
                        }
                        if (typeof msg.title === 'undefined') {
                            msg.title = 'An error occurred.';
                        }
                    }
                    else {
                        msg = (typeof msg === 'string') ? {
                            content: msg
                        } : msg;
                    }
                }

                var newMsg = new Message(msg);

                if (defaults.verticalPosition === 'bottom') {
                    messages.unshift(newMsg);
                }
                else {
                    messages.push(newMsg);
                }

                messageStack.push(newMsg.id);
                return newMsg.id;
            }
        };
    }]
    ;
}
;
