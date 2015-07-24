'use strict';

/**
 * The npUserInfo service provides some basic user information such as the user's operating system.
 *
 * @namespace npUserInfo
 */

var npUserInfo = ['$window', 'npConstants',
    function ($window, npConstants) {

        /**
         * @name getUserOS
         * @memberof npUserInfo
         * @returns {string} The users operating system. Supported operating systems are listed in npConstants.os.
         */
        var getUserOS = function () {
            var appVersion = $window.navigator.appVersion;
            if (appVersion.includes('Win')) {
                return npConstants.os.Windows;
            }
            if (appVersion.includes('Mac')) {
                return npConstants.os.MacOS;
            }
            if (appVersion.includes('X11')) {
                return npConstants.os.UNIX;
            }
            if (appVersion.includes('Linux')) {
                return npConstants.os.Linux;
            }
            return 'Unknown OS';
        };

        return {
            getUserOS: getUserOS
        };
    }
];

module.exports = npUserInfo;
