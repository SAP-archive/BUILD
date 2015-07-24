'use strict';

// @ngInject
module.exports = function () {
    var nextUniqueId = ['0', '0', '0'];
    var Util = {
        /**
         * nextUid, from angular.js.
         * A consistent way of creating unique IDs in angular. The ID is a sequence of alpha numeric
         * characters such as '012ABC'. The reason why we are not using simply a number counter is that
         * the number string gets longer over time, and it can also overflow, where as the nextId
         * will grow much slower, it is a string, and it will never overflow.
         *
         * @returns an unique alpha-numeric string
         */
        nextUid: function () {
            var index = nextUniqueId.length;
            var digit;

            while (index) {
                index--;
                digit = nextUniqueId[index].charCodeAt(0);
                if (digit === 57) {
                    nextUniqueId[index] = 'A';
                    return nextUniqueId.join('');
                }
                if (digit === 90) {
                    nextUniqueId[index] = '0';
                } else {
                    nextUniqueId[index] = String.fromCharCode(digit + 1);
                    return nextUniqueId.join('');
                }
            }
            nextUniqueId.unshift('0');
            return nextUniqueId.join('');
        }
    };
    return Util;
};
