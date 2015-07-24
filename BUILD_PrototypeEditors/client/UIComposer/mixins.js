'use strict';

var _ = require('norman-client-tp').lodash;

_.mixin({
    findParentByClass: function findParentByClass(elem, selector) {
        if (!elem[0] || elem[0] === document) {
            return;
        }
        else if (elem.hasClass(selector)) {
            return elem;
        }
        return findParentByClass(elem.parent(), selector);
    },
    /**
     * @name makeArray
     * @description Utility function that takes a value and turns it into an array.
     * @param {*} value
     * @returns {*[]} Array for provided value. If value is undefined, returns empty array.
     * If value is an array, returns value without modification.
     * If value is anything else, returns an array with value as the array's only elememt.
     */
    makeArray: function (value) {
        return _.compact(_.flatten([value]));
    },
    // fastest method to empty and add new elements in the same instance
    // http://stackoverflow.com/questions/1232040/empty-an-array-in-javascript
    setArrayValues: function (array, newValues) {
        if (Array.isArray(array)) {
            Array.prototype.splice.apply(array, [0, array.length].concat(newValues));
        }
        return array;
    }
});

/**
 * @name capitalize
 * @description Utility function that capitalizes the passed string
 * @param {string} string
 * @returns {string}
 */
// TODO remove this when updating to latest lodash version on norman/norman
if (typeof _.capitalize !== 'function') {
    _.mixin({
        capitalize: function (string) {
            if (typeof string === 'string' && string.length) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }
            return string;
        }
    });
}
