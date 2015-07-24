'use strict';

/**
 * @ngdoc factory
 * @name common.utils:featureToggle
 *
 * @description
 * Factory helper methods for determining if norman features have been switched on and are available for use.
 *
 */
// @ngInject
module.exports = function ($q, Auth) {
    return {
        /**
         * Indicates if the supplied feature is enabled in the current build.
         * *
         * @param featureId the id of the feature to check.
         * @returns {boolean} true if the supplied feature is enabled, false otherwise.
         */
        isEnabled: function (featureId) {
            var deferred = $q.defer();
            Auth.getFeatures().then(function (res) {
                var isEnabled = false;
                Object.keys(res.features).forEach(function (key) {
                    if (key.toLowerCase() === featureId.toLowerCase()) {
                        isEnabled = res.features[key].enabled;
                    }
                });
                deferred.resolve(isEnabled);
            });
            return deferred.promise;
        }
    }
}

