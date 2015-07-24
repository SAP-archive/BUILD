'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * @namespace npCanvasInlineEditHelper
 */
var npCanvasInlineEditHelper = [function () {
    var _isInlineEditing = false,
        _listeners = [];

    var startInlineEdit = function (possibleElements, x, y) {
        _isInlineEditing = true;
        _.forEach(_listeners, function (listener) {
            listener.call(this, possibleElements, x, y);
        });
    };

    var stopInlineEdit = function () {
        _isInlineEditing = false;
    };

    var isInlineEditing = function () {
        return _isInlineEditing;
    };

    var startListening = function (listener) {
        if (_.isFunction(listener)) {
            _listeners.push(listener);
            return function () {
                _.remove(_listeners, function (l) {
                    return l === listener;
                });
            };
        }
    };


    return {
        startInlineEdit: startInlineEdit,
        stopInlineEdit: stopInlineEdit,
        isInlineEditing: isInlineEditing,
        startListening: startListening
    };
}
];

module.exports = npCanvasInlineEditHelper;
