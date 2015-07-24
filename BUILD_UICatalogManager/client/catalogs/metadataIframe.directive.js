'use strict';

// @ngInject
module.exports = function() {
    return {
        scope: {
            callBack: '&iframeOnload'
        },
        link: function(scope, element) {
            element.on('load', function() {
                return scope.callBack();
            });
        }
    };
};
