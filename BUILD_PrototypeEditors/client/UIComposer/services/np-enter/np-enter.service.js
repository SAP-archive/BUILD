'use strict';

var _ = require('norman-client-tp').lodash;

var npEnter = ['$rootScope', '$timeout', 'npConstants',
    function ($rootScope, $timeout, npConstants) {
        var self = {};

        self.checkEnter = function (toStateName) {
            if (_.contains(npConstants.uiComposerStates, toStateName)) {
                $rootScope.$broadcast('UIComposer/onEnter');
            }
        };

        return self;
    }
];

module.exports = npEnter;
