'use strict';
/**
 * @todo all unnecessary callback to be removed
 *
 * @param $location
 * @param $rootScope
 * @param $http
 * @param User
 * @param $q
 * @returns {{login: Function, logout: Function, createUser: Function, changePassword: Function, updateProfile: Function, getCurrentUser: Function, currentUser: {}, isLoggedIn: Function, isLoggedInAsync: Function, isAdmin: Function, getToken: Function}}
 * @constructor
 */

    // @ngInject
module.exports = function Auth($location, $rootScope, $http, User, $q, $state, httpError, uiError) {

    var currentUser = {};

    function updateAvatarLink(user) {
        currentUser = user;
        if (user.avatar_url) {
            var avatarBroadcastObj = {
                hash: new Date().valueOf(),
                userUrl: user.avatar_url
            };
            $rootScope.$broadcast('userAvatarUpdated', avatarBroadcastObj);
        }
        return user;
    }

    var securityConfig = {};
    var featuresConfig = {};

    return {

        /**
         * Authenticate user and save token
         * @param  {Object}   user     - login info
         * @return {Promise}
         */
        login: function (user) {
            var deferred = $q.defer();

            $http.post('/auth/local', {
                email: user.email,
                password: user.password
            })
                .success(function (token) {
                    currentUser = User.get(updateAvatarLink);
                    deferred.resolve(token);

                })
                .error(function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        },
        signup: function (user) {
            var deferred = $q.defer();

            $http.post('/auth/signup', {
                name: user.name,
                email: user.email,
                password: user.password
            })
                .success(function (token) {
                    currentUser = User.get(updateAvatarLink);
                    deferred.resolve(token);

                })
                .error(function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        },
        signupSSO: function () {
            var deferred = $q.defer();
            $http.post('/auth/signupSSO', {})
                .success(function () {
                    currentUser = User.get(updateAvatarLink);
                    deferred.resolve();
                })
                .error(function (err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        },
        /**
         * request password
         * @param  {string}   email     - request password
         * @return {Promise}
         */
        requestPwd: function (email) {
            var deferred = $q.defer();
            return User.requestPwd({id: email},
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                })
                .$promise;
        },

        /**
         * [Reset Password Token Validation]
         * @param  {string} token
         * @return {$promise}
         */
        resetPasswordTokenValidation: function (token) {
            var deferred = $q.defer();
            return User.resetPasswordTokenValidation({id: token},
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                })
                .$promise;
        },

        /**
         * Delete access token and user info
         * @param  {Function}
         */
        logout: function () {
            currentUser = {};
            $state.go('login');
        },


        /**
         * Create a new user
         * @param  {Object}   user     - user info
         * @return {Promise}
         */
        createUser: function (user) {
            var deferred = $q.defer(),
                onSuccess = function (data) {
                    currentUser = User.get(updateAvatarLink);
                    deferred.resolve(data);
                },
                onError = function (err) {
                    this.logout();
                    deferred.reject(err);
                }
                    .bind(this);

            return User.save(user, onSuccess, onError).$promise;
        },

        /**
         * Verify  account email
         * @param  {string} token
         * @return $promise
         */
        verifyEmail: function (token) {

            return User.verifyEmail({id: token});
        },

        /**
         * Resend  Verification Email
         * @return $promise
         */
        resendVerificationEmail: function (email) {
            var deferred = $q.defer();
            User.resendVerificationEmail({id: email}).$promise
                .then(function () {
                    uiError.create({
                        content: 'A verification email has been resent.',
                        dismissOnTimeout: true,
                        dismissButton: true,
                        timeout: 5000,
                        className: 'success'
                    });
                    deferred.resolve();
                }).catch(function (err) {
                    httpError.create({
                        req: err,
                        content: 'Failed to resend a verification email.',
                        dismissOnTimeout: false,
                        dismissButton: true
                    });
                    deferred.reject(err);
                });
            return deferred.promise;
        },

        /**
         * Change password
         * @param  {String}   oldPassword
         * @param  {String}   newPassword
         * @return Promise
         */
        changePassword: function (oldPassword, newPassword) {
            var deferred = $q.defer();
            return User.changePassword({id: currentUser._id},
                {
                    oldPassword: oldPassword,
                    newPassword: newPassword
                },
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                })
                .$promise;
        },


        /**
         * Change avatar
         * @param  data:image/png;base64   picture
         * @param  data:image/png;base64  avatar
         * @return Promise
         */
        changeAvatar: function (type, avatar) {
            var deferred = $q.defer();

            return User.changeAvatar({id: currentUser._id},
                {
                    type: type,
                    avatar: avatar
                },
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                })
                .$promise;
        },

        /**
         * Delete avatar
         * @return Promise
         */
        deleteAvatar: function () {
            var deferred = $q.defer();

            return User.deleteAvatar({id: currentUser._id},
                {},
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                })
                .$promise;
        },

        /**
         * Get Preferences
         * @return Promise
         */
        getPreferences: function () {
            var deferred = $q.defer();

            return User.getPreferences(
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                })
                .$promise;
        },

        /**
         * Update Preferences
         * @return Promise
         */
        updatePreferences: function (preferences) {
            var deferred = $q.defer();

            return User.updatePreferences(preferences,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                })
                .$promise;
        },

        /**
         * Reset password
         * @param  {String}   oldPassword
         * @param  {String}   newPassword
         * @return Promise
         */
        resetPassword: function (token, newPassword) {
            var deferred = $q.defer();
            return User.resetPassword({id: token},
                {
                    newPassword: newPassword
                },
                function (data) {
                    deferred.resolve(data.token);
                },
                function (err) {
                    deferred.reject(err);
                })
                .$promise;
        },

        /**
         * Update Profile
         * @param  {Object}   user     - user info
         * @return Promise
         */
        updateProfile: function (user) {
            var deferred = $q.defer();

            return User.updateProfile({id: currentUser._id}, user,
                function (data) {
                    deferred.resolve(data);
                },
                function (err) {
                    deferred.reject(err);
                }
            ).$promise;
        },
        /**
         * Gets all available info on authenticated user
         * @return {Object} user
         */
        getCurrentUser: function () {
            return currentUser;
        },
        /**
         * Force info on authenticated user to be loaded
         * @return {Object} user
         */
        initCurrentUser: function () {
            if (!currentUser.hasOwnProperty('role') && !currentUser.hasOwnProperty('$promise')) {
                currentUser = User.get(updateAvatarLink);
            }
            return currentUser.$promise || currentUser;
        },

        /**
         * Check if a user is logged in
         * @return {Boolean}
         */
        isLoggedIn: function () {
            return currentUser.hasOwnProperty('role');
        },

        /**
         * Waits for currentUser to resolve before checking if user is logged in
         */
        isLoggedInAsync: function (cb) {

            if (currentUser.hasOwnProperty('$promise')) {
                currentUser.$promise.then(function () {
                    cb(true);
                }).catch(function (error) {
                    cb(false, error);
                });
            }
            else if (currentUser.hasOwnProperty('role')) {
                cb(true);
            }
            else {
                cb(false);
            }
        },

        /**
         * Get auth token
         */
        getToken: function () {
            return '';
        },

        getPasswordPolicy: function () {
            var deferred = $q.defer();

            $http.get('/auth/policy')
                .success(function (data) {
                    deferred.resolve(data);
                }).error(function (err) {
                    deferred.reject(err);
                });


            return deferred.promise;

        },

        getSecurityConfig: function () {
            var deferred = $q.defer();
            if (securityConfig.settings) {
                deferred.resolve(securityConfig);
            }
            else {
                $http.get('/auth/securityConfig')
                    .success(function (data) {
                        securityConfig = data;
                        deferred.resolve(data);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
            }

            return deferred.promise;
        },

        /**
         * Retrieve the list of features that can be toggled.
         *
         * @returns {Object} the list of features that can be toggled.
         */
        getFeatures: function () {
            var deferred = $q.defer();
            if (featuresConfig.features) {
                deferred.resolve(featuresConfig);
            }
            else {
                $http.get('/auth/features')
                    .success(function (data) {
                        featuresConfig = data;
                        deferred.resolve(data);
                    }).error(function (err) {
                        deferred.reject(err);
                    });
            }
            return deferred.promise;
        }
    };
};
