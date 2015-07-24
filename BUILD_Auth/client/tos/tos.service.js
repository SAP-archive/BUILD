'use strict';
// @ngInject
module.exports = function ($http, $q) {
    return {
        getPrivacyStatement: function () {
            var deferred = $q.defer();
              $http.get('/legal/terms/privacy_statement_EN.txt')
                .then(
                function (success) {
                    deferred.resolve(success.data);
                },
                function (error) {
                    deferred.reject(error);
                }
            );
            return deferred.promise;
        },

        getTermOfUse: function () {
            var deferred = $q.defer();
            $http.get('/legal/terms/tos_EN.txt')
                .then(
                function (success) {
                    deferred.resolve(success.data);
                },
                function (error) {
                    deferred.reject(error);
                }
            );
            return deferred.promise;
        }
    };
};
