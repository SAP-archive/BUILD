'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * Filter to display all comments grouped by context in Smart template mode
 * Move all comments from the current context to the top of that list
 */

// @ngInject
module.exports = function () {

    return function (obj, context, annotation) {
        var array = [];
        var arr = [];

        if (_.isNull(context)) {
            return obj;
        }

        Object.keys(obj).forEach(function (key) {
            array.push(obj[key]);
        });

        array = _.sortByAll(array, ['context.data']);

        _.forEach(array, function (myObj) {
            if (myObj.context.data === context) {
                arr.push(myObj);
            }
        });
        if (!annotation) {
            _.forEach(array, function (myObj) {
                if (myObj.context.data !== context) {
                    arr.push(myObj);
                }
            });
        }
        return arr;
    };

};
