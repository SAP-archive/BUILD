'use strict';
// @ngInject
module.exports = function ($q, $rootScope, $location) {
    return {

		// Add authorization token to headers
		request: function (config) {
			config.headers = config.headers || {};
			return config;
		},

		// Intercept 403s and redirect you to tos
		responseError: function (response) {
            if ((response.status === 403) && (response.headers('registration') && response.headers('registration').toLowerCase() === 'required')) {
                if (!$rootScope.tosRedirect) {
                    $rootScope.tosRedirect = $location.url();
                }

                 $location.path('/tos');
                 return $q.all(response);
            }
            return $q.reject(response);
		}
	};
};
