'use strict';

// @ngInject
module.exports = function ($rootScope, globals) {

    var _id = null;
    var _name = null;

    var that = {
        set id(val) {
            if (_id !== val) {
                _id = val;
                globals.displayNonPersistant = (_id !== null);
                $rootScope.$broadcast('projectChanged', val);
            }
        },
        get id() {
            return _id;
        },
        set name(val) {
            _name = val;
        },
        get name() {
            return _name;
        }
    };

    return that;
};
