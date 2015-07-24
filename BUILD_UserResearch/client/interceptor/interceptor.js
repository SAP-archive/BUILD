'use strict';
var _ = require('norman-client-tp').lodash;
var content = 'An error has occurred. Reload the page or try again later';
// @ngInject
module.exports = function ($q, $timeout, uiError) {
    return {
        responseError: function (response) {
            if (response.status !== 401) {
                if (response.config.url.indexOf('/studies') >= 0 || response.config.url.indexOf('/participant') >= 0) {
                 if (uiError.messages) {
                       var errCount = uiError.messages.length;
                        $timeout(function () {
                            if (uiError.messages.length === errCount && !_.find(uiError.messages, {content: content})) {
                                uiError.create({
                                    content: content, // + (response.data || response.statusText),
                                    dismissOnTimeout: false,
                                    dismissButton: true
                                });
                            }
                        });
                    }
                }
            }
            return $q.reject(response);
        }
    };
};
