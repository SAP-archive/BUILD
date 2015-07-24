'use strict';

var npLayoutHelper = [
    function () {
        var currentLayout;

        var setCurrentLayout = function (layout) {
            currentLayout = layout;
        };

        var getCurrentLayout = function () {
            return currentLayout;
        };

        // TODO fix once we support multiple layouts
        var isAbsoluteLayout = function () {
            return currentLayout === 'ABSOLUTE';
        };

        var service = {
            setCurrentLayout: setCurrentLayout,
            getCurrentLayout: getCurrentLayout,
            isAbsoluteLayout: isAbsoluteLayout
        };

        return service;
    }
];

module.exports = npLayoutHelper;
