'use strict';
// @ngInject
module.exports = function ($resource) {
    return $resource('/api/users/:id/:controller', { id: '@_id' }, {
        changePassword: { method: 'PUT', params: { controller: 'password' } },
        deleteAvatar: { method: 'DELETE', params: { controller: 'avatar' }},
        changeAvatar: { method: 'PUT', headers: { 'Content-Type': undefined }, transformRequest: function (data) {
            if (data === undefined) {
                return data;
            }
            var fd = new FormData();
            angular.forEach(data, function (value, key) {
                if (value instanceof FileList) {
                    if (value.length === 1) {
                        fd.append(key, value[0]);
                    }
                    else {
                        angular.forEach(value, function (file, index) {
                            fd.append(key + '_' + index, file);
                        });
                    }
                }
                else {
                    fd.append(key, value);
                }
            });

            return fd;
        }, params: { controller: 'avatar' } },
        resetPassword: { method: 'PUT', params: { controller: 'resetPassword' }, url: '/auth/:id/:controller' },

        updateProfile: { method: 'PUT', params: { controller: 'profile' } },
        verifyEmail: { method: 'GET', params: { controller: 'verifyEmail' }},
        resendVerificationEmail: { method: 'GET', params: { controller: 'resendVerificationEmail' }},

        requestPwd: { method: 'GET', params: { controller: 'requestPwd' }, url: '/auth/:id/:controller'},
        resetPasswordTokenValidation: { method: 'GET', params: { controller: 'resetPasswordTokenValidation' }, url: '/auth/:id/:controller'},

        get: { method: 'GET', params: { id: 'me' }},

        getPreferences: { method: 'GET', params: { id: 'me', controller: 'preferences' } },
        updatePreferences: { method: 'PUT', params: { id: 'me', controller: 'preferences' } },

        avatarList: { method: 'POST', params: { id: 'avatar' }, isArray: true}
    });
};
