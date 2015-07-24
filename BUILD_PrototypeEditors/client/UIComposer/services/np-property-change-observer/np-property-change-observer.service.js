'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * @namespace npPropertyChangeObserver
 */
var npPropertyChangeObserver = [function () {
    var _isPropertyChanging = false,
        _changeListeners = [],
        _changeDoneListeners = [];

    var doPropertyChange = function (controlMd, properties) {
        properties = _.makeArray(properties);
        _isPropertyChanging = true;
        _.forEach(_changeListeners, function (listener) {
            listener.call(this, controlMd, properties);
        });
    };

    var endPropertyChange = function (controlMd, properties) {
        properties = _.makeArray(properties);
        _isPropertyChanging = false;
        _.forEach(_changeDoneListeners, function (listener) {
            listener.call(this, controlMd, properties);
        });
    };

    var isPropertyChanging = function () {
        return _isPropertyChanging;
    };

    var listenForChange = function (listener) {
        if (_.isFunction(listener)) {
            _changeListeners.push(listener);
            return function () {
                _.remove(_changeListeners, function (l) {
                    return l === listener;
                });
            };
        }
    };

    var listenForChangeDone = function (listener) {
        if (_.isFunction(listener)) {
            _changeDoneListeners.push(listener);
            return function () {
                _.remove(_changeDoneListeners, function (l) {
                    return l === listener;
                });
            };
        }
    };

    return {
        doPropertyChange: doPropertyChange,
        endPropertyChange: endPropertyChange,
        isPropertyChanging: isPropertyChanging,
        listenForChange: listenForChange,
        listenForChangeDone: listenForChangeDone
    };
}
];

module.exports = npPropertyChangeObserver;
