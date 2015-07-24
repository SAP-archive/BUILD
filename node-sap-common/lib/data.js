'use strict';

/**
 * Deep copy
 * @param data
 * @returns {*}
 */
function clone(data) {
    var result, k, n, key, keys;
    if ((data === undefined) || (data === null)) {
        return data;
    }
    switch (typeof data) {
        case 'object':
        {
            if (Array.isArray(data)) {
                result = [];
                n = data.length;
                for (k = 0; k < n; ++k) {
                    result.push(clone(data[k]));
                }
            }
            else if (data instanceof Date) {
                result = new Date(data.getTime());
            }
            else {
                result = {};
                keys = Object.keys(data);
                n = keys.length;
                for (k = 0; k < n; ++k) {
                    key = keys[k];
                    result[key] = clone(data[key]);
                }
            }
            break;
        }
        default:
        {
            result = data;
        }
    }
    return result;
}

/**
 * Shallow copy
 * @param data
 * @returns {*}
 */
function copy(data) {
    var result, k, n, key, keys;
    if ((data === undefined) || (data === null)) {
        return data;
    }
    switch (typeof data) {
        case 'object':
        {
            if (Array.isArray(data)) {
                result = data.slice();
            }
            else if (data instanceof Date) {
                result = new Date(data.getTime());
            }
            else {
                result = {};
                keys = Object.keys(data);
                n = keys.length;
                for (k = 0; k < n; ++k) {
                    key = keys[k];
                    result[key] = data[key];
                }
            }
            break;
        }
        default:
        {
            result = data;
        }
    }
    return result;
}

/**
 * Enhance target with the properties of add. For object properties, it performs a deep merging
 * @param target
 * @param add
 * @returns {*}
 */
function merge(target, add) {
    var k, n, key, keys, value;

    if (add && typeof add === 'object') {
        keys = Object.keys(add);
        n = keys.length;
        for (k = 0; k < n; ++k) {
            key = keys[k];
            value = add[key];
            if ((typeof value !== 'object') || Array.isArray(value) || (value instanceof Date)) {
                target[key] = value;
            }
            else if ((target[key] !== undefined) && (typeof target[key] !== 'object')) {
                target[key] = value;
            }
            else {
                target[key] = target[key] || {};
                merge(target[key], value);
            }
        }
    }

    return target;
}

/**
 *
 * @param target
 * @returns {*|{}}
 */
function extend(target) {
    var k, n = arguments.length;
    target = target || {};
    if (typeof target !== 'object' && typeof target !== 'function') {
        target = {};
    }

    for (k = 1; k < n; ++k) {
        merge(target, clone(arguments[k]));
    }

    return target;
}

function shallowExtend(target) {
    var k, n = arguments.length;
    target = target || {};
    if (typeof target !== 'object' && typeof target !== 'function') {
        target = {};
    }

    for (k = 1; k < n; ++k) {
        merge(target, copy(arguments[k]));
    }

    return target;
}

module.exports = {
    clone: clone,
    copy: copy,
    extend: extend,
    merge: merge,
    shallowExtend: shallowExtend
};
