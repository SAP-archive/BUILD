'use strict';

var npFormFactor = [
    function () {
        var self = {},
            formFactors = [{
                name: 'Tablet',
                type: 'tablet',
                icon: 'prototype-assets--images--header--Device_Light_tablet-port',
                height: 1024 + 'px',
                width: 768 + 'px'
            }, {
                name: 'Desktop',
                type: 'desktop',
                icon: 'prototype-assets--images--header--DeviceLight_monitor',
                height: 1024 + 'px',
                width: 1280 + 'px'
            }, {
                name: 'Phone',
                type: 'phone',
                icon: 'prototype-assets--images--header--Device_Light_phone-port',
                height: 568 + 'px',
                width: 320 + 'px'
            }],
            currentFormFactor = formFactors[1];

        self.getAvailableFormFactors = function () {
            return formFactors;
        };

        self.setCurrentFormFactor = function (formFactor) {
            currentFormFactor = formFactor;
        };

        self.getCurrentFormFactor = function () {
            return currentFormFactor;
        };

        return self;
    }
];

module.exports = npFormFactor;
