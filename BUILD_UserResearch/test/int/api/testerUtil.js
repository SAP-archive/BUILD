'use strict';

/**
 * Returns a function to deal with a promise
 *
 * @param deferred
 * @returns {Function}
 */
function resolver(deferred){
    return function(err, res){
        if(err) deferred.reject(err)

        deferred.resolve(res);

    };

}

/**
 * Compares 2 objects keys
 *
 * @param a
 * @param b
 * @returns boolean
 */
function compareObject(a, b) {
    var aKeys = Object.keys(a).sort();
    var bKeys = Object.keys(b).sort();
    if (JSON.stringify(aKeys) === JSON.stringify(bKeys)) {
        return true;
    }
    else {
        return '' + JSON.stringify(aKeys) + ' does not equal ' + JSON.stringify(bKeys);
    }
}
exports.resolver = resolver;
exports.compareObject = compareObject;
