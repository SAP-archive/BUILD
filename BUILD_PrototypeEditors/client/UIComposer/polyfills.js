'use strict';

/**
 * @description Polyfill for Object.setPrototypeOf as suggested in
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
 * @type {Function|*}
 */
Object.setPrototypeOf = Object.setPrototypeOf || function (obj, proto) {
    /*eslint-disable */
    obj.__proto__ = proto;
    /*eslint-enable */
    return obj;
};

/**
 * @description Polyfill for the includes function that is part of the ES6 proposal.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
 */
if (!String.prototype.includes) {
    /*eslint-disable */
    String.prototype.includes = function () {
    /*eslint-enable */
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}
