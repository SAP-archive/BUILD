'use strict';

module.exports = ['$q', '$rootScope', 'uiError', '$injector', '$stateParams',
    function ($q, $rootScope, uiError, $injector, $stateParams) {
        return {
            responseError: function (response) {
                if (response.status !== 401) {
                    if (response.config.url.indexOf('/models') >= 0) {
                        // Prototype is not locked anymore, actions on prototype fail and send back to project page
                        // SWPRE004: 'Session timed out. There is no object lock'
                        if (response.data && response.data.code && (response.data.code === 'SWPRE004')) {
                            $injector.get('$state').go('shell.project.prototype', {
                                currentProject: $stateParams.currentProject
                            });
                        }
                        // Standard behavior for any other errors
                        else {
                            var message = (response.data && response.data.message) ? response.data.message : response.statusText;
                            uiError.create({
                                content: message.replace(/\n/g, '<br />'),
                                dismissOnTimeout: false,
                                dismissButton: true
                            });
                        }
                    }
                }
                return $q.reject(response);
            }
        };
    }];
