'use strict';

// @ngInject
module.exports = function() {
    return function(obj, type) {
        var nb = 0;
        angular.forEach(obj, function(value/**, key**/) {
            if (value.type === type) {
                nb++;
            }
        });
        return nb;
    };
};
