'use strict';

var npZoomHelper = [function () {
    var zoomLevel = 1;

    var getZoomLevel = function () {
        return zoomLevel;
    };

    var setZoomLevel = function (newValue) {
        zoomLevel = newValue;
    };

    return {
        getZoomLevel: getZoomLevel,
        setZoomLevel: setZoomLevel
    };
}];

module.exports = npZoomHelper;
